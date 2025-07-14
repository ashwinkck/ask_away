from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import requests
import logging
from bs4 import BeautifulSoup
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

model_id = "microsoft/Phi-3-mini-128k-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    torch_dtype="auto",
    trust_remote_code=True
)
chat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

REFERENCE_LINKS = []
REFERENCE_CONTENT = {}

def fetch_content_from_url(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")
        title = soup.title.string if soup.title else ""
        paragraphs = " ".join(p.get_text() for p in soup.find_all("p")[:10])
        return f"{title}\n{paragraphs}".strip()
    except Exception as e:
        logging.error(f"Error fetching {url}: {e}")
        return ""

@app.route("/set_links", methods=["POST"])
def set_links():
    global REFERENCE_LINKS, REFERENCE_CONTENT
    REFERENCE_LINKS = request.json.get("links", [])
    if not REFERENCE_LINKS or len(REFERENCE_LINKS) > 3:
        return jsonify({"error": "Please provide 1–3 valid links."}), 400

    REFERENCE_CONTENT = {}
    for link in REFERENCE_LINKS:
        content = fetch_content_from_url(link)
        if content:
            REFERENCE_CONTENT[link] = content

    return jsonify({"message": "Reference links and content updated."})

def build_prompt(query):
    if not REFERENCE_CONTENT:
        return None, "No reference content available."

    ctx = "\n\n".join(
        f"{content}\nSource: {link}"
        for link, content in REFERENCE_CONTENT.items()
    )
    messages = [
        {"role": "system", "content": f"You are a helpful assistant. Use ONLY the following information and include source links:\n\n{ctx}"},
        {"role": "user", "content": query}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return prompt, ctx

def generate(prompt):
    result = chat_pipeline(prompt, max_new_tokens=256, temperature=0.2)[0]['generated_text']
    return result.split(prompt)[-1].strip()

@app.route("/chat", methods=["POST"])
def chat():
    q = request.json.get("message", "").strip()
    if not q:
        return jsonify({"reply": "Please provide a valid message."}), 400

    prompt, ctx_or_error = build_prompt(q)

    if not prompt:
        return jsonify({"reply": ctx_or_error}), 400

    reply = generate(prompt)

    references = "\n".join(f"Source: {link}" for link in REFERENCE_LINKS)

    return jsonify({"reply": f"{reply}\n\nReferences:\n{references}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
