
from fastapi import FastAPI
import chromadb
import requests

app = FastAPI()
CHROMA_FOLDER = "chroma_db"

OLLAMA_URL = "http://ollama:11434"
EMBEDDING_MODEL = "nomic-embed-text"

client = chromadb.PersistentClient(path = CHROMA_FOLDER)
collection = client.get_collection(
   name = "company_knowledge"
)

def get_embedding(text):
   response = requests.post(
      f"{OLLAMA_URL}/api/embed",
      json = {
           "model" : EMBEDDING_MODEL,
           "input" : text
      }
   )
   print("ollama_Status", response.status_code)
   print("ollama_Response", response.text)
   response.raise_for_status()

   data = response.json()

   if "embeddings" not in data:
      raise Exception(f"Embedding Failed: {data}")
   return data["embeddings"][0]

@app.get("/")
def home():
    return {
        "service": "Retrieval Service",
        "status" : "running"
    }

@app.post("/retrieve")
def retrieve(data:dict):
    question = data["question"]
    query_embedding = get_embedding(question)
    results = collection.query(
       query_embeddings = [query_embedding],
       n_results = 3
    )
    documents = results["documents"][0]
    context = "\n\n".join(documents)
    return{
        "question": question,
        "context": context
    }

