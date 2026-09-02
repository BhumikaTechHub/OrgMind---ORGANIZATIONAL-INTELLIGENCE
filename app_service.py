from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RETRIEVAL_SERVICE = "http://retrieval_service:8001"
LLM_SERVICE = "http://llm_service:8002"

@app.get("/")
def home():
    return {
       "service":"Application service",
       "status":"running"
    }


@app.post("/ask")
def ask(data:dict):
   question = data["question"]
   retrieval_response = requests.post(
      f"{RETRIEVAL_SERVICE}/retrieve",
      json = {
          "question":question
      }
   )
   retrieval_response.raise_for_status()
   context = retrieval_response.json()["context"]

   llm_response = requests.post(
      f"{LLM_SERVICE}/generate",
      json = {
         "question": question,
         "context": context
      }
   )

   llm_response.raise_for_status()
   answer = llm_response.json()["answer"]
   return{
       "question": question,
       "context": context,
       "answer": answer
   }








