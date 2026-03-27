# 🚗 ANPR Detection System

Automatic Number Plate Recognition (ANPR) using YOLOv8 for plate detection and PaddleOCR for character recognition.

## 📋 Project Structure

```
licence_plate_detection/
├── api/                    # FastAPI backend
│   ├── main.py            # Main API with /detect and /plates endpoints
│   ├── calibrate_ocr.py   # OCR calibration utility
│   └── readme.txt
├── frontend/              # Next.js frontend
│   ├── pages/
│   │   ├── _app.js       # App wrapper
│   │   └── index.js      # Main page with UI
│   ├── styles/
│   │   └── globals.css   # Global styles with animations
│   ├── package.json
│   ├── next.config.js
│   └── .env.local        # Environment variables
├── anpr_env/             # Python virtual environment
├── paddle_env310/        # Paddle OCR environment
├── model/                # Model storage
├── runs/                 # YOLOv8 training outputs
├── sql/                  # SQL scripts
└── data.yaml            # Dataset config
```

## 🔧 Prerequisites

- Python 3.10+
- Node.js 16+
- MySQL database (anpr_db)
- GPU (optional, but recommended)

## 🚀 Installation & Setup

### 1. Backend Setup

```powershell
# Activate Python environment
cd c:\Users\monda\OneDrive\Drive\licence_plate_detection
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
& .\anpr_env\Scripts\Activate.ps1

# Install/update dependencies if needed
pip install fastapi uvicorn python-multipart sqlalchemy pymysql opencv-python ultralytics paddleocr numpy

# Verify database connection
# Update DATABASE_URL in api/main.py if needed:
# DATABASE_URL = "mysql+pymysql://root:1234@localhost:3306/anpr_db"
```

### 2. Frontend Setup

```powershell
cd frontend
npm install

# Update .env.local if API is on different host
# NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## ▶️ Running the Application

### Terminal 1: Backend API

```powershell
cd c:\Users\monda\OneDrive\Drive\licence_plate_detection
& .\anpr_env\Scripts\Activate.ps1
uvicorn api.main:app --reload
```

Server runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### Terminal 2: Frontend Dev Server

```powershell
cd c:\Users\monda\OneDrive\Drive\licence_plate_detection\frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

## 📡 API Endpoints

### POST `/detect`
Detect license plates in an uploaded image.

**Request:**
- Body: Form data with `file` (image file)

**Response:**
```json
{
  "vehicles_detected": 2,
  "results": [
    {
      "plate_number": "DL01AB1234",
      "vehicle_type": "car",
      "ocr_confidence": 0.95
    }
  ]
}
```

### GET `/plates`
Fetch stored detections from database.

**Parameters:**
- `limit` (optional): Max records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "plate_number": "DL01AB1234",
    "vehicle_type": "car",
    "vehicle_color": "unknown",
    "timestamp": "2026-03-23T10:30:00",
    "yolo_confidence": 0.87,
    "ocr_confidence": 0.95,
    "plate_bbox": [x1, y1, x2, y2],
    "vehicle_bbox": [x1, y1, x2, y2]
  }
]
```

## 🎨 Frontend Features

### Detect Tab
- Drag-and-drop image upload
- Click to browse files
- File validation (images only)
- Shows uploaded file size
- Displays detection results in table
- Shows confidence scores with progress bars

### Stored Plates Tab
- View all detections from database
- Table with:
  - ID
  - License plate number
  - Vehicle type
  - Timestamp
  - YOLO confidence
  - OCR confidence
- Refresh button to reload data
- Responsive design

## 🔌 CORS Configuration

Backend allows requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Update `api/main.py` if frontend URL changes:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://your-frontend-url:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🗄️ Database Schema

**Table: detections**
- `id` (INT, Primary Key)
- `plate_number` (VARCHAR 20)
- `vehicle_type` (VARCHAR 20)
- `vehicle_color` (VARCHAR 20)
- `timestamp` (DATETIME)
- `yolo_confidence` (FLOAT)
- `ocr_confidence` (FLOAT)
- `plate_bbox` (TEXT - JSON)
- `vehicle_bbox` (TEXT - JSON)

Create database:
```sql
CREATE DATABASE IF NOT EXISTS anpr_db;
USE anpr_db;
-- Tables auto-created by SQLAlchemy on first run
```

## 🧠 Models Used

- **Plate Detection**: YOLOv8 (custom trained)
  - Path: `C:/Users/monda/runs/detect/best/best.pt`
  - Input size: 1280x1280
  - Confidence threshold: 0.2

- **Vehicle Detection**: YOLOv8n (pretrained)
  - Detects: car (2), motorcycle (3), truck (7)
  - Confidence threshold: 0.3

- **OCR**: PaddleOCR
  - Supports plate format: `[STATE][2-DIGIT][SERIES][4-DIGIT]`
  - Angle classification enabled
  - GPU disabled (set to CPU by default)

## 📊 Plate Format Supported

Indian vehicle number plates: `AP15AB1234`
- **State**: 2 letters (AP, DL, MH, etc.)
- **District**: 2 digits
- **Series**: 2 letters
- **Number**: 4 digits

## ⚙️ Configuration

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

**Backend (api/main.py):**
```python
DATABASE_URL = "mysql+pymysql://root:1234@localhost:3306/anpr_db"
YOLO_PLATE_MODEL = r"C:/Users/monda/runs/detect/best/best.pt"
```

## 🎯 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check DATABASE_URL credentials
- Verify database exists: `CREATE DATABASE anpr_db;`

### CORS Error
- Check frontend URL in CORS config
- Ensure backend is running on `http://localhost:8000`
- Check `.env.local` has correct API_BASE

### Model Loading Error
- Verify model paths exist
- For plate model: `C:/Users/monda/runs/detect/best/best.pt`
- YOLOv8n will auto-download on first run

### Drag-Drop Not Working
- Use Chrome/Edge for best compatibility
- Clear browser cache and refresh
- Check browser console for errors (F12)

## 📦 Build for Production

```powershell
# Frontend
cd frontend
npm run build
npm start

# Backend
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## 🔒 Security Notes

- Change default MySQL password
- Use environment variables for sensitive data
- Add authentication for API if exposing publicly
- Validate file uploads more strictly
- Use HTTPS in production

## 📝 License

Internal use only

---

**Created**: March 2026
**Last Updated**: March 23,2026
