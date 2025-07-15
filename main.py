from flask import Flask, request, jsonify, Response
import requests
from flask_cors import CORS

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

@app.route("/")
def index():
    return jsonify({"message": "Gateway is running. Use /llm/* or /ocr/* endpoints."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
