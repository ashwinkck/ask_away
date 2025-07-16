from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import requests
import os
import re
import json
import threading

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
EXTRACTED_TEXT_PATH = os.path.join(os.path.dirname(__file__), '..', 'extracted_text_trocr.txt')
ALLOWED_SITES_PATH = os.path.join(os.path.dirname(__file__), '..', 'allowed_sites.json')

ALLOWED_SITES_LOCK = threading.Lock()

def save_allowed_sites(sites):
    with ALLOWED_SITES_LOCK:
        with open(ALLOWED_SITES_PATH, 'w', encoding='utf-8') as f:
            json.dump(sites, f, indent=2, ensure_ascii=False)

def add_allowed_site(site):
    sites = load_allowed_sites()
    if site not in sites:
        sites.append(site)
        save_allowed_sites(sites)
    return sites

def load_allowed_sites():
    if os.path.exists(ALLOWED_SITES_PATH):
        try:
            with open(ALLOWED_SITES_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and 'sites' in data:
                return data['sites']
        except Exception as e:
            logging.error(f"Failed to load allowed sites: {e}")
    return []

ALLOWED_SITES = load_allowed_sites()

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

@app.route('/admin/add-allowed-site', methods=['POST'])
def admin_add_allowed_site():
    data = request.get_json()
    site = data.get('site')
    if not site or not isinstance(site, str):
        return jsonify({'error': 'Missing or invalid site'}), 400
    updated_sites = add_allowed_site(site)
    return jsonify({'allowed_sites': updated_sites}), 200

@app.route('/admin/allowed-sites', methods=['GET'])
def admin_get_allowed_sites():
    sites = load_allowed_sites()
    return jsonify({'allowed_sites': sites}), 200

def fetch_web_results(q, serper_api_key):
    # Add site restriction to the query if allowed sites are specified
    if ALLOWED_SITES:
        site_filter = " OR ".join([f"site:{site}" for site in ALLOWED_SITES])
        filtered_query = f"{q} {site_filter}"
    else:
        filtered_query = q
    try:
        res = requests.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": serper_api_key},
            json={"q": filtered_query},
            timeout=5
        )
        if res.status_code == 200:
            # Optionally filter results to only allowed sites
            results = res.json().get("organic", [])
            if ALLOWED_SITES:
                results = [r for r in results if any(site in r.get('link', '') for site in ALLOWED_SITES)]
            return results
        logging.warning(f"Search API error: {res.status_code} {res.text}")
    except requests.RequestException as e:
        logging.error(f"Web search failed: {e}")
    return []

# Utility to search extracted_text_trocr.txt for relevant context
def fetch_local_context(query, max_chunks=3):
    if not os.path.exists(EXTRACTED_TEXT_PATH):
        return None
    try:
        with open(EXTRACTED_TEXT_PATH, 'r', encoding='utf-8') as f:
            text = f.read()
        # Extract keywords from the query (ignore common stopwords and short words)
        stopwords = set([
            'the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'who', 'when', 'where', 'how', 'why', 'are', 'was', 'is', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'by', 'as', 'it', 'be', 'or', 'if', 'do', 'does', 'did', 'can', 'could', 'should', 'would', 'but', 'so', 'not', 'about', 'into', 'which', 'their', 'them', 'they', 'you', 'your', 'we', 'our', 'us', 'he', 'she', 'his', 'her', 'him', 'its', 'have', 'has', 'had', 'will', 'just', 'than', 'then', 'too', 'also', 'more', 'most', 'some', 'such', 'no', 'nor', 'very', 'over', 'under', 'out', 'up', 'down', 'off', 'again', 'once', 'only', 'all', 'any', 'each', 'few', 'other', 'own', 'same', 'so', 'because', 'until', 'while', 'during', 'before', 'after', 'above', 'below', 'between', 'both', 'through', 'further', 'my', 'me', 'your', 'yours', 'theirs', 'ours', 'mine', 'yourselves', 'ourselves', 'themselves', 'himself', 'herself', 'itself', 'am', 'were', 'being', 'been', 'having', 'doing', 'against', 'off', 'per', 'via', 'etc'
        ])
        words = re.findall(r'\b\w+\b', query.lower())
        keywords = [w for w in words if w not in stopwords and len(w) > 2]
        if not keywords:
            return None
        chunks = text.split('\n--- Page')
        relevant = []
        for chunk in chunks:
            chunk_lower = chunk.lower()
            if any(kw in chunk_lower for kw in keywords):
                relevant.append(chunk.strip())
            if len(relevant) >= max_chunks:
                break
        if relevant:
            return '\n\n'.join(relevant)
    except Exception as e:
        logging.error(f"Failed to read local context: {e}")
    return None

def build_prompt(query, serper_api_key):
    # First, try to get context from extracted_text_trocr.txt
    local_ctx = fetch_local_context(query)
    if local_ctx:
        messages = [
            {"role": "system", "content": f"You are a helpful assistant,which concise the infos and explain it maximum 5 lines:\n\n{local_ctx}"},
            {"role": "user", "content": query}
        ]
        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        return prompt
    # Fallback to web search (Serper)
    web = fetch_web_results(query, serper_api_key)
    if not web:
        return None
    ctx = "\n\n".join(
        f"{r.get('title')}\n{r.get('snippet')}\nSource: {r.get('link')}"
        for r in web[:3] if r.get('snippet')
    )
    messages = [
        {"role": "system", "content": f"You are a helpful assistant,which concise the infos and explain it maximum 5 lines:\n\n{ctx}"},
        {"role": "user", "content": query}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return prompt

def generate(prompt):
    result = chat_pipeline(prompt, max_new_tokens=256, temperature=0.2)[0]['generated_text']
    return result.split(prompt)[-1].strip()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True) 