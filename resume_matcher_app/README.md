Upload a resume PDF + job description.
The AI returns:
- Match %
- Missing skills
- Improvement tips

## Setup
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY='your-api-key-here'
python app.py
```

## Test with curl
```bash
curl -X POST -F "resume=@your_resume.pdf" -F "jd=Job description here" http://localhost:5000/upload
```