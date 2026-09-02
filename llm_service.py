from fastapi import FastAPI
import requests

app = FastAPI()


OLLAMA_URL = "http://ollama:11434"
LLM_MODEL = "llama3.2:1b"

@app.get("/")
def home():
   return {
      "service": "LLM SERVICE",
      "status": "running"
  }


@app.post("/generate")
def generate(data:dict):
    question = data["question"]
    context = data["context"]
    prompt = f"""
   You are an HR assistant.

   Use following context to answer question:

Context:
 {context}

Question:
 {question}

Answer only using information available in context.
If information is not available, say : 
    "I dont have this information in my knowledge base"

"""

    response = requests.post( 
       f"{OLLAMA_URL}/api/generate",
       json = {
          "model": LLM_MODEL,
          "prompt": prompt,
          "stream": False
       }
    )
    response.raise_for_status()

    return {

        "answer": response.json()["response"]
    }

