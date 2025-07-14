from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import requests
import logging
from bs4 import BeautifulSoup
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import textwrap

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

# Initialize ChromaDB and embedding model
chroma_client = chromadb.Client(Settings(persist_directory=".chromadb"))
collection = chroma_client.get_or_create_collection("reference_content")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

REFERENCE_LINKS = []
REFERENCE_CONTENT = {}  # Still used for source links

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

# Helper to split content into chunks
def split_into_chunks(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i+chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks

@app.route("/set_links", methods=["POST"])
def set_links():
    import traceback
    global REFERENCE_LINKS, REFERENCE_CONTENT
    REFERENCE_LINKS = request.json.get("links", [])
    if not REFERENCE_LINKS or len(REFERENCE_LINKS) > 3:
        return jsonify({"error": "Please provide 1–3 valid links."}), 400

    REFERENCE_CONTENT = {}
    # Clear previous data by deleting all IDs
    all_ids = collection.get()["ids"]
    if all_ids:
        collection.delete(ids=all_ids)
    success_links = []
    failed_links = []
    for link in REFERENCE_LINKS:
        try:
            content = fetch_content_from_url(link)
            if not content or len(content.strip()) < 20:
                failed_links.append({"link": link, "reason": "No or too little content fetched."})
                continue
            REFERENCE_CONTENT[link] = content
            chunks = split_into_chunks(content)
            if not chunks:
                failed_links.append({"link": link, "reason": "No chunks created from content."})
                continue
            embeddings = embedder.encode(chunks).tolist()
            ids = [f"{link}_{i}" for i in range(len(chunks))]
            metadatas = [{"link": link, "chunk": chunk} for chunk in chunks]
            collection.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=chunks)
            success_links.append(link)
        except Exception as e:
            logging.error(f"Error processing link {link}: {e}\n{traceback.format_exc()}")
            failed_links.append({"link": link, "reason": str(e)})
    summary = {"message": "Reference links processed.", "success": success_links, "failed": failed_links}
    return jsonify(summary)

def build_prompt(query):
    if collection.count() == 0:
        return None, "No reference content available."
    # Embed query and retrieve top-3 relevant chunks
    query_emb = embedder.encode([query]).tolist()[0]
    results = collection.query(query_embeddings=[query_emb], n_results=3)
    ctx_chunks = []
    used_links = set()
    for meta in results["metadatas"][0]:
        ctx_chunks.append(f"{meta['chunk']}\nSource: {meta['link']}")
        used_links.add(meta['link'])
    ctx = "\n\n".join(ctx_chunks)
    messages = [
        {"role": "system", "content": f"You are a helpful assistant. Use ONLY the following information and include source links:\n\n{ctx}"},
        {"role": "user", "content": query}
    ]
    prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    return prompt, used_links

def generate(prompt):
    result = chat_pipeline(prompt, max_new_tokens=256, temperature=0.2)[0]['generated_text']
    return result.split(prompt)[-1].strip()

@app.route("/chat", methods=["POST"])
def chat():
    q = request.json.get("message", "").strip()
    if not q:
        return jsonify({"reply": "Please provide a valid message."}), 400

    prompt, used_links_or_error = build_prompt(q)
    if not prompt:
        return jsonify({"reply": used_links_or_error}), 400

    reply = generate(prompt)
    # Only show references actually used
    references = "\n".join(f"Source: {link}" for link in used_links_or_error)
    return jsonify({"reply": f"{reply}\n\nReferences:\n{references}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
