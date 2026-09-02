

import os
import requests
import chromadb

DOCUMENT_FOLDER = "knowledge_base"
CHROMA_FOLDER = "chroma_db"

OLLAMA_URL = "http://localhost:11434/api/embed"
EMBEDDING_MODEL = "nomic-embed-text"
client = chromadb.PersistentClient(path = CHROMA_FOLDER)
collection  = client.get_or_create_collection(
   name = "company_knowledge"
)

def create_chunks(text, chunk_size = 500):
      words = text.split()
      chunks = []

      for i in range(0,len(words),chunk_size):
          chunk = " ".join(words[i:i + chunk_size])
          chunks.append(chunk)
      return chunks

def get_embedding(text):
     response = requests.post(
        OLLAMA_URL, 
        json =  {
                   "model":EMBEDDING_MODEL,
                   "input":text
        }
     )
     response.raise_for_status()
     return response.json()["embeddings"][0]


document_id = 0
for filename in os.listdir(DOCUMENT_FOLDER):
   if not filename.endswith(".txt"):
      continue
   filepath = os.path.join(DOCUMENT_FOLDER, filename)
   with open(filepath, "r", encoding ="utf-8") as file:
      text = file.read()
   chunks = create_chunks(text)
   for chunk in chunks:
      embedding = get_embedding(chunk)
      collection.add(
          ids =  [str(document_id)],
          documents = [chunk],
          embeddings = [embedding],
          metadatas = [{"source": filename}]
      )
      document_id += 1       
print("Knowledge base created successfully")
print("Documents/chunks stored:", document_id)
 
