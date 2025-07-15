from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import requests

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

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

SERPER_API_KEY = "07a71ac759204c2fafccf9289fa46481bf8b252b"

@app.route("/llm/models", methods=["GET"])
def list_models():
    return jsonify({
        "object": "list",
        "data": [
            {
                "id": model_id,
                "object": "model",
                "created": 0,
                "owned_by": "custom",
                "permission": []
            }
        ]
    })

@app.route("/llm/chat/completions", methods=["POST"])
def chat_completions():
    data = request.json
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"error": "No messages provided."}), 400

    q = messages[-1]["content"]
    prompt = build_prompt(q, SERPER_API_KEY)
    if not prompt:
        return jsonify({"error": "No relevant information found."}), 400

    reply = generate(prompt)
    response = {
        "id": "chatcmpl-custom-001",
        "object": "chat.completion",
        "created": 0,
        "model": model_id,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": reply
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": len(tokenizer(prompt)["input_ids"]),
            "completion_tokens": len(tokenizer(reply)["input_ids"]),
            "total_tokens": len(tokenizer(prompt + reply)["input_ids"]),
        }
    }
    return jsonify(response)

def fetch_web_results(q, serper_api_key):
    try:
        res = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": serper_api_key},
            json={"q": q},
            timeout=5
        )
        if res.status_code == 200:
            return res.json().get("organic", [])
        logging.warning(f"Search API error: {res.status_code} {res.text}")
    except requests.RequestException as e:
        logging.error(f"Web search failed: {e}")
    return []

def build_prompt(query, serper_api_key):
    web = fetch_web_results(query, serper_api_key)
    if not web:
        return None
    ctx = "\n\n".join(
        f"{r.get('title')}\n{r.get('snippet')}\nSource: {r.get('link')}"
        for r in web[:3] if r.get('snippet')
    )
    messages = [
        {"role": "system", "content": f"You are a helpful assistant. Use ONLY the following information and include source links:\n\n{ctx}"},
        {"role": "user", "content": query}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return prompt

def generate(prompt):
    result = chat_pipeline(prompt, max_new_tokens=256, temperature=0.2)[0]['generated_text']
    return result.split(prompt)[-1].strip()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True) 