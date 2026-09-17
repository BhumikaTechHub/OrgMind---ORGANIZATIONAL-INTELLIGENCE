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
        "service": "Application service",
        "status": "running"
    }


@app.post("/ask")
def ask(data: dict):

    question = data["question"]

    retrieval_response = requests.post(
        f"{RETRIEVAL_SERVICE}/retrieve",
        json={
            "question": question
        }
    )

    retrieval_response.raise_for_status()

    context = retrieval_response.json()["context"]

    llm_response = requests.post(
        f"{LLM_SERVICE}/generate",
        json={
            "question": question,
            "context": context
        }
    )

    llm_response.raise_for_status()

    llm_data = llm_response.json()



    return {
        "question": question,
        "context": context,
        "answer": llm_data["answer"],

        "model": llm_data.get("model"),
        "prompt_tokens": llm_data.get("prompt_tokens"),
        "response_tokens": llm_data.get("response_tokens"),
        "total_tokens": llm_data.get("total_tokens"),

        "latency_seconds": llm_data.get("latency_seconds"),
        "ollama_total_duration_seconds": llm_data.get(
            "ollama_total_duration_seconds"
        ),
        "generation_seconds": llm_data.get(
            "generation_seconds"
        ),
        "tokens_per_second": llm_data.get(
            "tokens_per_second"
        )
    }
