from flask import Flask, request, jsonify
import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

# Set your installed Tesseract executable path here
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

app = Flask(__name__)

def pdf_pages_to_images_from_bytes(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    images = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        images.append((page_num + 1, img))
    doc.close()
    return images

def ocr_single_page(page_data):
    page_num, img = page_data
    result = pytesseract.image_to_string(img, lang="eng")
    return page_num, result

def perform_tesseract_ocr_parallel(images):
    results = []
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(ocr_single_page, img_data) for img_data in images]
        for future in as_completed(futures):
            results.append(future.result())
    results.sort(key=lambda x: x[0])  # Ensure pages are in order
    return results

@app.route("/ocr/extract", methods=["POST"])
def ocr_extract():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Please upload a PDF file."}), 400
    try:
        pdf_bytes = file.read()
        images = pdf_pages_to_images_from_bytes(pdf_bytes)
        if not images:
            return jsonify({"error": "No images extracted from PDF."}), 400
        results = perform_tesseract_ocr_parallel(images)
        # Return as JSON: { page_number: text, ... }
        text_by_page = {f"page_{page_num}": text for page_num, text in results}
        return jsonify({"text": text_by_page})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ocr/extract-from-uploaded", methods=["POST"])
def ocr_extract_from_uploaded():
    data = request.get_json()
    if not data or 'filename' not in data:
        return jsonify({"error": "Missing filename in request."}), 400
    filename = data['filename']
    pdf_path = os.path.join('uploaded_pdfs', filename)
    output_path = 'extracted_text_trocr.txt'
    if not os.path.exists(pdf_path):
        return jsonify({"error": f"File not found: {pdf_path}"}), 404
    try:
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        images = pdf_pages_to_images_from_bytes(pdf_bytes)
        if not images:
            return jsonify({"error": "No images extracted from PDF."}), 400
        results = perform_tesseract_ocr_parallel(images)
        with open(output_path, "w", encoding="utf-8") as out_f:
            for page_num, text in results:
                out_f.write(f"--- Page {page_num} ---\n")
                out_f.write(text + "\n\n")
        return jsonify({"message": f"Extracted text written to {output_path}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True) 