from fastapi import FastAPI
import requests
import time
import os

app = FastAPI()

OLLAMA_URL = "http://ollama:11434"

# Default model
DEFAULT_MODEL = os.getenv(
    "LLM_MODEL",
    "qwen2.5:0.5b"
)

# Models allowed in OrgMind
ALLOWED_MODELS = {
    "qwen2.5:0.5b",
    "gemma3:270m",
    "smollm2:360m"
}


# ======================================================
# HOME
# ======================================================

@app.get("/")
def home():

    return {
        "service": "LLM SERVICE",
        "status": "running",
        "default_model": DEFAULT_MODEL,
        "available_models": list(ALLOWED_MODELS)
    }


# ======================================================
# GENERATE ANSWER
# ======================================================

@app.post("/generate")
def generate(data: dict):

    question = data["question"]
    context = data["context"]

    # Get model selected by frontend
    selected_model = data.get(
        "model",
        DEFAULT_MODEL
    )

    # Make sure only our three models can be selected
    if selected_model not in ALLOWED_MODELS:
        selected_model = DEFAULT_MODEL

    # ==================================================
    # PROMPT
    # ==================================================
    prompt = f"""
Answer the question using the context below.

Context:
{context}

Question:
{question}

Give a short direct answer.

If the answer is clearly present in the context, use it.

If it is not present, say:
"I don't have this information in my knowledge base."

Answer:
"""

    # ==================================================
    # START LATENCY
    # ==================================================

    start_time = time.perf_counter()

    # ==================================================
    # CALL OLLAMA
    # ==================================================

    response = requests.post(

        f"{OLLAMA_URL}/api/generate",

        json={

            "model": selected_model,

            "prompt": prompt,

            "stream": False,

            "options": {
                "num_predict": 100,
                "temperature": 0
            }

        },

        timeout=180
    )

    # ==================================================
    # END LATENCY
    # ==================================================

    end_time = time.perf_counter()

    latency_seconds = (
        end_time - start_time
    )

    response.raise_for_status()

    result = response.json()

    # ==================================================
    # TOKEN METRICS
    # ==================================================

    prompt_tokens = result.get(
        "prompt_eval_count",
        0
    )

    response_tokens = result.get(
        "eval_count",
        0
    )

    total_tokens = (
        prompt_tokens +
        response_tokens
    )

    # ==================================================
    # OLLAMA PERFORMANCE METRICS
    # ==================================================

    total_duration = (
        result.get("total_duration", 0)
        / 1_000_000_000
    )

    prompt_duration = (
        result.get("prompt_eval_duration", 0)
        / 1_000_000_000
    )

    generation_duration = (
        result.get("eval_duration", 0)
        / 1_000_000_000
    )

    if generation_duration > 0:

        tokens_per_second = (
            response_tokens /
            generation_duration
        )

    else:

        tokens_per_second = 0

    # ==================================================
    # RETURN
    # ==================================================

    return {

        "answer": result.get(
            "response",
            ""
        ),

        # Selected model
        "model": selected_model,

        # Token metrics
        "prompt_tokens": prompt_tokens,

        "response_tokens": response_tokens,

        "total_tokens": total_tokens,

        # Performance metrics
        "latency_seconds": round(
            latency_seconds,
            3
        ),

        "ollama_total_duration": round(
            total_duration,
            3
        ),

        "prompt_processing_seconds": round(
            prompt_duration,
            3
        ),

        "generation_seconds": round(
            generation_duration,
            3
        ),

        "tokens_per_second": round(
            tokens_per_second,
            2
        )
    }
