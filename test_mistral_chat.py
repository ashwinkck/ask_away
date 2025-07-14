from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import requests
import logging

logging.basicConfig(level=logging.INFO)

model_id = "microsoft/Phi-3-mini-128k-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    torch_dtype="auto",
    trust_remote_code=True
)
chat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

SERPER_API_KEY = "07a71ac759204c2fafccf9289fa46481bf8b252b"

app = Flask(__name__)

def fetch_web_results(q):
    try:
        res = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": SERPER_API_KEY},
            json={"q": q},
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("organic", [])
        logging.warning(f"Search API error: {res.status_code} {res.text}")
    except requests.RequestException as e:
        logging.error(f"Web search failed: {e}")
    return []

def build_prompt(query, results):
    if not results:
        return None, "No relevant information found for your query. Please try rephrasing."

    ctx = "\n\n".join(
        f"{r.get('title')}\n{r.get('snippet')}\nSource: {r.get('link')}"
        for r in results[:3] if r.get('snippet')
    )

    messages = [
        {"role": "system", "content": f"You are a helpful assistant. Use ONLY the following information and include source links:\n\n{ctx}"},
        {"role": "user", "content": query}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return prompt, results

def generate(prompt):
    result = chat_pipeline(prompt, max_length=1024, temperature=0.2)[0]['generated_text']
    return result.split(prompt)[-1].strip()

@app.route("/chat", methods=["POST"])
def chat():
    q = request.json.get("message", "").strip()
    if not q:
        return jsonify({"reply": "Please provide a valid message."}), 400

    web = fetch_web_results(q)
    prompt, web_links = build_prompt(q, web)

    if not prompt:
        return jsonify({"reply": web_links})  # web_links contains error message here

    reply = generate(prompt)
    references = "\n".join(f"Source: {r.get('link')}" for r in web_links[:3] if r.get('link'))

    return jsonify({"reply": f"{reply}\n\nReferences:\n{references}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
