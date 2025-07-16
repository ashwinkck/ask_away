from flask import Flask, request, jsonify, Response
import requests
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

CORE_URL = "http://localhost:8001"
OCR_URL = "http://localhost:8002"

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

@app.route('/ask-pdf', methods=["POST"])
def ask_pdf():
    data = request.get_json()
    if not data or 'file' not in data or 'question' not in data:
        return jsonify({"error": "Missing file or question in request."}), 400
    try:
        # Decode the base64 PDF
        pdf_bytes = base64.b64decode(data['file'])
        # Send to OCR service
        files = {'file': ('document.pdf', pdf_bytes, 'application/pdf')}
        ocr_resp = requests.post(f"{OCR_URL}/ocr/extract", files=files)
        if ocr_resp.status_code != 200:
            return jsonify({"error": "OCR service error", "details": ocr_resp.text}), 500
        ocr_data = ocr_resp.json()
        extracted_text = "\n".join(ocr_data.get("text", {}).values())
        # Compose prompt for LLM
        prompt = f"Use the following extracted text from a PDF to answer the question.\n\nExtracted Text:\n{extracted_text}\n\nQuestion: {data['question']}"
        llm_payload = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that answers questions based on provided PDF text."},
                {"role": "user", "content": prompt}
            ]
        }
        llm_resp = requests.post(f"{CORE_URL}/llm/chat/completions", json=llm_payload)
        if llm_resp.status_code != 200:
            return jsonify({"error": "LLM service error", "details": llm_resp.text}), 500
        return jsonify(llm_resp.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return jsonify({"message": "Gateway is running. Use /llm/* or /ocr/* endpoints."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
