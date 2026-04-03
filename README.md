# 🚗 License Plate Detection v2

A computer vision project for **automatic license plate detection and recognition** using deep learning and OCR techniques. This system detects license plates from images/videos and extracts the text efficiently.

---

## 📌 Features

- 🔍 Detects license plates in images and videos  
- 🧠 Extracts text using OCR  
- 🎥 Supports both image and video input  
- ⚡ Fast and efficient pipeline  
- 🧩 Modular design (Detection → Cropping → Recognition)

---

## 🛠️ Tech Stack

- Python  
- OpenCV  
- NumPy  
- YOLO / CNN (for detection)  
- Tesseract / EasyOCR (for text recognition)

---

## 📂 Project Structure

```
License_Plate_Detectionv2/
│── data/                # Input images/videos
│── models/              # Trained models
│── output/              # Output results
│── utils/               # Helper scripts
│── main.py              # Main file
│── requirements.txt     # Dependencies
│── README.md            # Documentation
```

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Arnab325/License_Plate_Detectionv2.git
cd License_Plate_Detectionv2
```

### 2. Create a virtual environment (optional)
```bash
python -m venv venv
source venv/bin/activate     # Mac/Linux
venv\Scripts\activate        # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

---

## ▶️ Usage

### Run on Image
```bash
python main.py --image path/to/image.jpg
```

### Run on Video
```bash
python main.py --video path/to/video.mp4
```

---

## 📊 Output

- Processed images/videos will be saved in the `output/` folder  
- Detected license plate text will be displayed in the console  

Example:
```
Detected Plate: MH12AB1234
Confidence: 92%
```

---

## 🔄 Workflow

1. Input image/video  
2. Detect license plate  
3. Crop detected region  
4. Apply OCR  
5. Display and save results  

---

## 🚀 Future Improvements

- Improve OCR accuracy with custom models  
- Real-time webcam support  
- Web app deployment (Flask/Streamlit)  
- Multi-country plate recognition  

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Make your changes  
4. Submit a Pull Request  

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Arnab**  
GitHub: https://github.com/Arnab325
