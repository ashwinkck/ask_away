from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from matcher import match_resume_to_jd

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload():
    if "resume" not in request.files or "jd" not in request.form:
        return jsonify({"error": "Missing resume or JD"}), 400

    resume_file = request.files["resume"]
    jd_text = request.form["jd"]

    # Extract text from PDF
    try:
        reader = PdfReader(resume_file)
        resume_text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {e}"}), 500

    # Call matching logic
    result = match_resume_to_jd(resume_text, jd_text)
    return jsonify(result)
if __name__ == "__main__":
    app.run(debug=True, port=5000)
