import cv2
import numpy as np
import re
import json
import math
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from datetime import datetime
from paddleocr import PaddleOCR

from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# ================= APP =================
app = FastAPI(title="ANPR MULTI-PLATE FINAL")

# CORS settings so frontend on localhost:3000 can call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATABASE =================
DATABASE_URL = "mysql+pymysql://root:1234@localhost:3306/anpr_db"
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True)
    plate_number = Column(String(20))
    vehicle_type = Column(String(20))
    vehicle_color = Column(String(20))
    timestamp = Column(DateTime)
    yolo_confidence = Column(Float)
    ocr_confidence = Column(Float)
    plate_bbox = Column(Text)
    vehicle_bbox = Column(Text)

Base.metadata.create_all(bind=engine)

# ================= MODELS =================
plate_model = YOLO(r"C:/Users/monda/runs/detect/best/best.pt")
vehicle_model = YOLO("yolov8n.pt")

ocr = PaddleOCR(use_angle_cls=True, use_gpu=False)

VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 7: "truck"}

VALID_STATES = {
 'AP','AR','AS','BR','CG','CH','DD','DL','DN','GA','GJ','HP','HR',
 'JH','JK','KA','KL','LA','LD','MH','ML','MN','MP','MZ','NL',
 'OD','PB','PY','RJ','SK','TN','TR','TS','UK','UP','WB'
}

# ================= HELPERS =================

def expand_box(box, img, pad=60):
    x1, y1, x2, y2 = box
    h, w = img.shape[:2]
    return [
        max(0, x1 - pad),
        max(0, y1 - pad),
        min(w, x2 + pad),
        min(h, y2 + pad)
    ]

# 🔥 AI correction
def smart_correct_plate(text):
    text = text.upper()
    text = re.sub(r'[^A-Z0-9]', '', text)

    if len(text) < 6:
        return ""

    state = text[:2]
    district = text[2:4]
    series = text[4:-4]
    number = text[-4:]

    state = ''.join([c if c.isalpha() else 'A' for c in state])

    district = ''.join([
        c if c.isdigit() else ('0' if c == 'O' else '1')
        for c in district
    ])

    series = ''.join([
        c if c.isalpha() else 'A'
        for c in series
    ])

    number = ''.join([
        c if c.isdigit() else (
            '0' if c == 'O' else
            '1' if c in ['I','L'] else
            '2' if c == 'Z' else
            '8' if c == 'B' else
            '0'
        )
        for c in number
    ])

    return state + district + series + number

def is_valid_plate(txt):
    if len(txt) < 8 or len(txt) > 10:
        return False

    if txt[:2] not in VALID_STATES:
        return False

    if not txt[2:4].isdigit():
        return False

    if not txt[-4:].isdigit():
        return False

    return True

def read_plate_paddle(img):

    candidates = []

    for _ in range(2):
        res = ocr.ocr(img, cls=True)
        if res and res[0]:
            txt = "".join([line[1][0] for line in res[0]])
            candidates.append(txt)

    if not candidates:
        return "", 0.0

    best_raw = max(candidates, key=len)
    corrected = smart_correct_plate(best_raw)

    confs = []
    res = ocr.ocr(img, cls=True)
    if res and res[0]:
        confs = [line[1][1] for line in res[0]]

    avg_conf = float(sum(confs)/len(confs)) if confs else 0.0

    return corrected, avg_conf

def center(box):
    return ((box[0]+box[2])//2, (box[1]+box[3])//2)

def dist(a, b):
    return math.hypot(a[0]-b[0], a[1]-b[1])

# ================= API =================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    session = SessionLocal()

    img = cv2.imdecode(
        np.frombuffer(await file.read(), np.uint8),
        cv2.IMREAD_COLOR
    )

    vehicles = []

    # -------- VEHICLE DETECTION --------
    vres = vehicle_model(img, conf=0.3)
    for b in vres[0].boxes:
        cls = int(b.cls[0])
        if cls in VEHICLE_CLASSES:
            box = list(map(int, b.xyxy[0]))
            vehicles.append({
                "type": VEHICLE_CLASSES[cls],
                "bbox": box,
                "center": center(box)
            })

    # -------- PLATE DETECTION --------
    pres = plate_model(img, conf=0.2, imgsz=1280)

    results = []

    for p in pres[0].boxes:

        pb = list(map(int, p.xyxy[0]))
        pb = expand_box(pb, img)

        crop = img[pb[1]:pb[3], pb[0]:pb[2]]

        text, ocr_conf = read_plate_paddle(crop)

        # -------- RELAXED FILTER --------
        if not text:
            continue

        if ocr_conf < 0.4:
            continue

        if not is_valid_plate(text) and len(text) < 8:
            continue

        nearest = min(
            vehicles,
            key=lambda v: dist(center(pb), v["center"]),
            default=None
        )

        vehicle_type = nearest["type"] if nearest else "unknown"

        results.append({
            "plate_number": text,
            "vehicle_type": vehicle_type,
            "ocr_confidence": ocr_conf
        })

        # save to DB
        session.add(Detection(
            plate_number=text,
            vehicle_type=vehicle_type,
            vehicle_color="unknown",
            timestamp=datetime.now(),
            yolo_confidence=float(p.conf[0]),
            ocr_confidence=ocr_conf,
            plate_bbox=json.dumps(pb),
            vehicle_bbox=json.dumps(nearest["bbox"]) if nearest else "{}"
        ))

    # -------- SMART DUPLICATE REMOVAL --------
    final_results = []

    for r in results:
        exists = False
        for f in final_results:
            if r["plate_number"][:6] == f["plate_number"][:6]:
                exists = True
                break
        if not exists:
            final_results.append(r)

    results = final_results

    session.commit()
    session.close()

    return {
        "vehicles_detected": len(results),
        "results": results
    }


@app.get("/plates")
def get_stored_plates(limit: int = 100):
    session = SessionLocal()
    query = session.query(Detection).order_by(Detection.timestamp.desc()).limit(limit)
    records = query.all()
    session.close()

    return [
        {
            "id": r.id,
            "plate_number": r.plate_number,
            "vehicle_type": r.vehicle_type,
            "vehicle_color": r.vehicle_color,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "yolo_confidence": r.yolo_confidence,
            "ocr_confidence": r.ocr_confidence,
            "plate_bbox": json.loads(r.plate_bbox) if r.plate_bbox else None,
            "vehicle_bbox": json.loads(r.vehicle_bbox) if r.vehicle_bbox else None,
        }
        for r in records
    ]