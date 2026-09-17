from fastapi import FastAPI
import requests
import time
import os

app = FastAPI()

OLLAMA_URL = "http://ollama:11434"

# Model can be changed without modifying the code
LLM_MODEL = os.getenv("LLM_MODEL", "qwen2.5:0.5b")


@app.get("/")
def home():
    return {
        "service": "LLM SERVICE",
        "status": "running",
        "model": LLM_MODEL
    }


@app.post("/generate")
def generate(data: dict):

    question = data["question"]
    context = data["context"]

    # Same prompt for every model
    prompt = f"""
You are an HR assistant.

Use following context to answer question:

Context:
{context}

Question:
{question}

Answer only using information available in context.

If information is not available, say:
"I dont have this information in my knowledge base"
"""

    # Start latency measurement
    start_time = time.perf_counter()

    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": LLM_MODEL,
            "prompt": prompt,
            "stream": False,
            "options":{
               "num_predict": 100,
               "temperature": 0
            }

        }
    )

    # End latency measurement
    end_time = time.perf_counter()

    response.raise_for_status()

    result = response.json()

    # ---------------------------------------
    # Ollama performance metrics
    # ---------------------------------------

    latency_seconds = end_time - start_time

    prompt_tokens = result.get("prompt_eval_count", 0)
    response_tokens = result.get("eval_count", 0)

    total_tokens = prompt_tokens + response_tokens

    # Ollama reports duration in nanoseconds
    total_duration = result.get("total_duration", 0) / 1_000_000_000

    prompt_duration = result.get("prompt_eval_duration", 0) / 1_000_000_000

    generation_duration = result.get("eval_duration", 0) / 1_000_000_000

    # Tokens generated per second
    if generation_duration > 0:
        tokens_per_second = response_tokens / generation_duration
    else:
        tokens_per_second = 0

    return {
        "answer": result["response"],

        # Model information
        "model": LLM_MODEL,

        # Token metrics
        "prompt_tokens": prompt_tokens,
        "response_tokens": response_tokens,
        "total_tokens": total_tokens,

        # Performance metrics
        "latency_seconds": round(latency_seconds, 3),
        "ollama_total_duration_seconds": round(total_duration, 3),
        "prompt_processing_seconds": round(prompt_duration, 3),
        "generation_seconds": round(generation_duration, 3),
        "tokens_per_second": round(tokens_per_second, 2)
    }
