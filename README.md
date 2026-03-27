# 🚗 License Plate Detection v2

An advanced **Automatic Number Plate Recognition (ANPR)** system that detects vehicle license plates from images/videos and extracts the plate number using computer vision and OCR techniques.

---

## 📌 Features

* 🔍 Detects license plates from images or video streams
* 🧠 Uses deep learning/object detection models (e.g., YOLO)
* 🖼️ Image preprocessing for better accuracy
* 🔤 Extracts text using OCR (Tesseract/EasyOCR)
* ⚡ Fast and efficient pipeline
* 💾 Option to save detected results

---

## 🛠️ Tech Stack

* **Python**
* **OpenCV** – Image processing
* **YOLO / Deep Learning Model** – Plate detection
* **Tesseract / EasyOCR** – Text recognition
* **NumPy / Pandas** – Data handling

---

## 📂 Project Structure

```
License_Plate_Detectionv2/
│
├── images/               # Input images
├── outputs/              # Output results
├── models/               # Trained model weights
├── detect.py             # Plate detection script
├── ocr.py                # OCR processing
├── main.py               # Main execution file
├── requirements.txt      # Dependencies
└── README.md             # Project documentation
```

---

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/Arnab325/License_Plate_Detectionv2.git
cd License_Plate_Detectionv2
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install Tesseract (if using Tesseract OCR):

* **Windows**: Download from official site and add to PATH
* **Linux**:

```bash
sudo apt install tesseract-ocr
```

---

## ▶️ Usage

Run the main script:

```bash
python main.py
```

Or for detection only:

```bash
python detect.py
```

---

## 🔄 Workflow

1. **Input Image/Video**
2. **License Plate Detection**
3. **Image Preprocessing**
4. **OCR Text Extraction**
5. **Output Display / Save Results**

---

## 📸 Example Output

* Input: Vehicle image
* Output:

  * Detected plate (bounding box)
  * Extracted number (e.g., `WB06AB1234`)

---

## ⚠️ Limitations

* Performance may drop in:

  * Low lighting conditions 🌙
  * Blurry or angled images 📉
  * Non-standard plate formats

---

## 💡 Future Improvements

* Improve OCR accuracy with deep learning
* Support real-time video streams
* Add web/app interface
* Train model on Indian number plates dataset

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 🙌 Acknowledgements

* OpenCV community
* YOLO developers
* OCR libraries (Tesseract/EasyOCR)

---

## 📬 Contact

For queries or collaboration:

* GitHub: https://github.com/Arnab325

---

⭐ If you found this project useful, consider giving it a star!
