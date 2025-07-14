import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY is not set")

API_URL = "https://openrouter.ai/api/v1/chat/completions"

def match_resume_to_jd(resume_text, jd_text):
    prompt = f"""
You are a smart HR analyst. Given the resume and job description below, provide the following:

1. **Match Percentage** (0–100). Respond with a number first, e.g., `85%`.
2. **Key Strengths**: What stands out positively in the resume?
3. **Weak Areas**: What's missing or underwhelming?
4. **Smart Suggestions**: How can the resume be improved to better match the job?

Always assume the resume is genuine, even if short.

Resume:
{resume_text}

Job Description:
{jd_text}
"""

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    data = {
        "model": "mistralai/mistral-7b-instruct",  # or any other available model
        "messages": [
            {"role": "system", "content": "You are a helpful HR assistant."},
            {"role": "user", "content": prompt}
        ],
    }

    response = requests.post(API_URL, headers=headers, json=data)

    if response.status_code != 200:
        raise Exception(f"OpenRouter API failed: {response.status_code} {response.text}")

    output = response.json()
    return { "result": output["choices"][0]["message"]["content"].strip() }
