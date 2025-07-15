import pytesseract
import fitz  # PyMuPDF
from PIL import Image
import io
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

FILE_PATH = r"C://Users//ashwi//OneDrive//Desktop//Module_4[1].pdf"
OUTPUT_TEXT_FILE = "extracted_text_tesseract.txt"

# Set your installed Tesseract executable path here
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

def pdf_pages_to_images(pdf_path):
    doc = fitz.open(pdf_path)
    images = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        images.append((page_num + 1, img))
    doc.close()
    print(f"Extracted {len(images)} pages as images from PDF.")
    return images

def ocr_single_page(page_data):
    page_num, img = page_data
    result = pytesseract.image_to_string(img, lang="eng")
    preview = result[:100].replace("\n", " ")
    print(f"Page {page_num} processed. Preview: {preview}")
    return page_num, result

def perform_tesseract_ocr_parallel(images, output_path=OUTPUT_TEXT_FILE):
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    results = []
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(ocr_single_page, img_data) for img_data in images]
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(key=lambda x: x[0])  # Ensure pages are in order

    with open(output_path, "w", encoding="utf-8") as f:
        for page_num, text in results:
            f.write(f"--- Page {page_num} ---\n")
            f.write(text + "\n\n")

    print(f"\nSaved all extracted text to '{output_path}'")

def main():
    try:
        if not os.path.exists(FILE_PATH):
            raise FileNotFoundError(f"File not found: {FILE_PATH}")

        images = pdf_pages_to_images(FILE_PATH)

        if not images:
            print("No images to process.")
            return

        print("\n" + "=" * 50)
        print("STARTING Tesseract OCR EXTRACTION WITH THREADING...")
        print("=" * 50)

        perform_tesseract_ocr_parallel(images)

    except Exception as e:
        print(f"Error in main function: {e}")

if __name__ == "__main__":
    main()
