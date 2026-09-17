import csv
import time
import requests
import subprocess
import os


API_URL = "http://localhost:8000/ask"
QUESTIONS_FILE = "evaluation_questions.csv"
RESULTS_FILE = "evaluation/results.csv"

MODELS = [
    "qwen2.5:0.5b",
    "gemma3:270m",
    "smollm2:360m"
]

TIMEOUT = 180


# ============================================================
# LOAD QUESTIONS
# ============================================================

with open(QUESTIONS_FILE, "r", encoding="utf-8") as file:
    all_questions = list(csv.DictReader(file))


questions = (
    all_questions[0:2] +
    all_questions[6:8] +
    all_questions[10:12] +
    all_questions[15:17] +
    all_questions[20:22]
)
# ============================================================
# LOAD EXISTING RESULTS
# ============================================================

results = []

if os.path.exists(RESULTS_FILE):

    with open(
        RESULTS_FILE,
        "r",
        encoding="utf-8",
        newline=""
    ) as file:

        results = list(csv.DictReader(file))

    print("Existing results loaded:", len(results))


# ============================================================
# SAVE RESULTS FUNCTION
# ============================================================

def save_results():

    fieldnames = [
        "question_id",
        "category",
        "question",
        "model",
        "answer",
        "context",
        "latency_seconds",
        "prompt_tokens",
        "response_tokens",
        "total_tokens"
    ]

    with open(
        RESULTS_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(results)


# ============================================================
# CHECK IF RESULT ALREADY EXISTS
# ============================================================

def already_completed(model, question_id):

    for row in results:

        if (
            row.get("model") == model
            and row.get("question_id") == question_id
            and not row.get("answer", "").startswith("ERROR")
        ):
            return True

    return False


# ============================================================
# EVALUATION
# ============================================================

for model in MODELS:

    print("\n")
    print("=" * 70)
    print("TESTING MODEL:", model)
    print("=" * 70)


    # --------------------------------------------------------
    # Start LLM service with selected model
    # --------------------------------------------------------

    env = os.environ.copy()
    env["LLM_MODEL"] = model

    print("Starting LLM service:", model)

    try:

        subprocess.run(
            [
                "docker",
                "compose",
                "up",
                "-d",
                "--build",
                "--force-recreate",
                "llm_service"
            ],
            env=env,
            check=True
        )

    except subprocess.CalledProcessError:

        print("Could not restart LLM service.")
        continue


    # Give service time to start
    time.sleep(5)


    # --------------------------------------------------------
    # Verify model
    # --------------------------------------------------------

    try:

        status = requests.get(
            "http://localhost:8002/",
            timeout=10
        )

        print("Active service:", status.json())

    except Exception as e:

        print("Could not verify LLM service:", e)


    # --------------------------------------------------------
    # Run questions
    # --------------------------------------------------------

    for q in questions:

        question_id = q["id"]
        question = q["question"]
        category = q["category"]


        # ----------------------------------------------------
        # Skip already completed questions
        # ----------------------------------------------------

        if already_completed(model, question_id):

            print(
                f"SKIPPING {model} -> {question_id} "
                "(already completed)"
            )

            continue


        print("\n")
        print("-" * 70)
        print(
            f"{model} -> {question_id}: {question}"
        )
        print("-" * 70)


        start = time.perf_counter()


        try:

            response = requests.post(
                API_URL,
                json={
                    "question": question
                },
                timeout=TIMEOUT
            )


            latency = time.perf_counter() - start


            if response.status_code == 200:

                data = response.json()


                result = {

                    "question_id": question_id,

                    "category": category,

                    "question": question,

                    "model": model,

                    "answer": data.get(
                        "answer",
                        ""
                    ),

                    "context": data.get(
                        "context",
                        ""
                    ),

                    "latency_seconds": round(
                        latency,
                        3
                    ),

                    "prompt_tokens": data.get(
                        "prompt_tokens",
                        ""
                    ),

                    "response_tokens": data.get(
                        "response_tokens",
                        ""
                    ),

                    "total_tokens": data.get(
                        "total_tokens",
                        ""
                    )
                }


                results.append(result)


                # SAVE IMMEDIATELY
                save_results()


                print(
                    f"SUCCESS: {model} -> {question_id}"
                )

                print(
                    f"Latency: {latency:.2f} seconds"
                )


            else:

                print(
                    f"HTTP ERROR: {response.status_code}"
                )


        except requests.exceptions.Timeout:

            print(
                f"TIMEOUT: {model} -> {question_id}"
            )

            print(
                "Skipping this question and continuing..."
            )

            continue


        except requests.exceptions.ConnectionError as e:

            print(
                f"CONNECTION ERROR: {model} -> {question_id}"
            )

            print(e)

            continue


        except Exception as e:

            print(
                f"ERROR: {model} -> {question_id}"
            )

            print(e)

            continue


# ============================================================
# FINAL SAVE
# ============================================================

save_results()


print("\n")
print("=" * 70)
print("EVALUATION FINISHED")
print("=" * 70)

print(
    "Results saved to:",
    RESULTS_FILE
)

print(
    "Total successful/recorded results:",
    len(results)
)


# ============================================================
# SUMMARY
# ============================================================

for model in MODELS:

    count = sum(
        1 for row in results
        if row.get("model") == model
    )

    print(
        f"{model}: {count} results"
    )
