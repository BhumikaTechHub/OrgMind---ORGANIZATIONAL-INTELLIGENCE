from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# ======================================================
# CORS
# ======================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# SERVICES
# ======================================================

RETRIEVAL_SERVICE = "http://retrieval_service:8001"
LLM_SERVICE = "http://llm_service:8002"


# ======================================================
# HOME
# ======================================================

@app.get("/")
def home():
    return {
        "service": "Application service",
        "status": "running"
    }


# ======================================================
# ASK QUESTION
# ======================================================

@app.post("/ask")
def ask(data: dict):

    # Get question from frontend
    question = data["question"]

    # Get selected model from frontend
    # If no model is provided, use Qwen as default
    selected_model = data.get(
        "model",
        "qwen2.5:0.5b"
    )

    # ==================================================
    # STEP 1: RETRIEVE CONTEXT
    # ==================================================

    retrieval_response = requests.post(
        f"{RETRIEVAL_SERVICE}/retrieve",
        json={
            "question": question
        }
    )

    retrieval_response.raise_for_status()

    context = retrieval_response.json()["context"]

    # ==================================================
    # STEP 2: SEND QUESTION + CONTEXT + MODEL
    # ==================================================

    llm_response = requests.post(
        f"{LLM_SERVICE}/generate",
        json={
            "question": question,
            "context": context,
            "model": data.get("model", "qwen2.5:0.5b")
        },
        timeout=180
    )

    llm_response.raise_for_status()

    llm_data = llm_response.json()

    # ==================================================
    # STEP 3: RETURN RESPONSE TO FRONTEND
    # ==================================================

    return {
        "question": question,
        "context": context,
        "answer": llm_data.get("answer", ""),

        # Selected model
        "model": llm_data.get(
            "model",
            selected_model
        ),

        # Token metrics
        "prompt_tokens": llm_data.get(
            "prompt_tokens"
        ),

        "response_tokens": llm_data.get(
            "response_tokens"
        ),

        "total_tokens": llm_data.get(
            "total_tokens"
        ),

        # Performance metrics
        "latency_seconds": llm_data.get(
            "latency_seconds"
        ),

        "ollama_total_duration": llm_data.get(
            "ollama_total_duration"
        ),

        "prompt_processing_seconds": llm_data.get(
            "prompt_processing_seconds"
        ),

        "generation_seconds": llm_data.get(
            "generation_seconds"
        ),

        "tokens_per_second": llm_data.get(
            "tokens_per_second"
        )
    }
