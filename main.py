from flask import Flask, request, jsonify, Response
import requests
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

CORE_URL = "http://localhost:8001"
OCR_URL = "http://localhost:8002"

UPLOAD_DIR = os.path.join(os.getcwd(), 'uploaded_pdfs')
EXTRACTED_TEXT_PATH = os.path.join(os.getcwd(), 'extracted_text_trocr.txt')

# Proxy for LLM endpoints
@app.route('/llm/<path:path>', methods=["GET", "POST"])
def proxy_llm(path):
    url = f"{CORE_URL}/llm/{path}"
    if request.method == "POST":
        resp = requests.post(url, json=request.get_json(), headers={k: v for k, v in request.headers if k != 'Host'})
    else:
        resp = requests.get(url, headers={k: v for k, v in request.headers if k != 'Host'})
    return Response(resp.content, status=resp.status_code, content_type=resp.headers.get('Content-Type'))

# Proxy for OCR endpoints
@app.route('/ocr/<path:path>', methods=["GET", "POST"])
def proxy_ocr(path):
    url = f"{OCR_URL}/ocr/{path}"
    if request.method == "POST":
        # For file uploads, forward files and form data
        if request.files:
            files = {key: (f.filename, f.stream, f.mimetype) for key, f in request.files.items()}
            data = request.form.to_dict()
            resp = requests.post(url, files=files, data=data, headers={k: v for k, v in request.headers if k != 'Host'})
        else:
            resp = requests.post(url, json=request.get_json(), headers={k: v for k, v in request.headers if k != 'Host'})
    else:
        resp = requests.get(url, headers={k: v for k, v in request.headers if k != 'Host'})
    return Response(resp.content, status=resp.status_code, content_type=resp.headers.get('Content-Type'))

@app.route('/ask-pdf', methods=['POST'])
def ask_pdf():
    if 'file' not in request.files or 'question' not in request.form:
        return jsonify({'error': 'File and question are required.'}), 400

    file = request.files['file']
    question = request.form['question']

    # 1. Send PDF to OCR backend
    ocr_resp = requests.post(
        f"{OCR_URL}/ocr/extract",
        files={'file': (file.filename, file.stream, file.mimetype)}
    )
    if ocr_resp.status_code != 200:
        return jsonify({'error': 'OCR failed', 'details': ocr_resp.text}), 500

    extracted = ocr_resp.json().get('text', {})
    context = "\n\n".join(extracted.values())

    # 2. Send context + question to LLM backend
    llm_payload = {
        "messages": [
            {"role": "system", "content": f"Use ONLY the following context to answer the user's question:\n\n{context}"},
            {"role": "user", "content": question}
        ]
    }
    llm_resp = requests.post(f"{CORE_URL}/llm/chat/completions", json=llm_payload)
    if llm_resp.status_code != 200:
        return jsonify({'error': 'LLM failed', 'details': llm_resp.text}), 500

    return jsonify(llm_resp.json())

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400
    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed.'}), 400

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    file.save(save_path)

    # Send to OCR backend for extraction
    with open(save_path, 'rb') as f:
        ocr_resp = requests.post(
            f"{OCR_URL}/ocr/extract",
            files={'file': (file.filename, f, file.mimetype)}
        )
    if ocr_resp.status_code != 200:
        return jsonify({'error': 'OCR failed', 'details': ocr_resp.text}), 500

    extracted = ocr_resp.json().get('text', {})
    with open(EXTRACTED_TEXT_PATH, 'a', encoding='utf-8') as out_f:
        out_f.write(f"--- {file.filename} ---\n")
        for page, text in extracted.items():
            out_f.write(f"{page}\n{text}\n\n")

    return jsonify({'success': True, 'filename': file.filename, 'saved_path': save_path})

@app.route("/")
def index():
    return jsonify({"message": "Gateway is running. Use /llm/* or /ocr/* endpoints."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
