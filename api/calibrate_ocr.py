import easyocr
import cv2
import os
import re
from collections import defaultdict

reader = easyocr.Reader(['en'], gpu=True)

synthetic_dir = "synthetic"
confusions = defaultdict(lambda: defaultdict(int))

for file in os.listdir(synthetic_dir):
    gt = os.path.splitext(file)[0].upper()   # ground truth
    img = cv2.imread(os.path.join(synthetic_dir, file), cv2.IMREAD_GRAYSCALE)

    pred = reader.readtext(img, detail=0)
    if not pred:
        continue

    pred = "".join(pred).upper()

    for g, p in zip(gt, pred):
        if g != p:
            confusions[p][g] += 1

print("COMMON OCR CONFUSIONS:")
for wrong, fixes in confusions.items():
    print(wrong, "→", dict(fixes))
