import csv
from collections import defaultdict

FILE = "evaluation/results.csv"

data = defaultdict(list)

with open(FILE, "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)

    for row in reader:
        model = row["model"]

        try:
            latency = float(row["latency_seconds"])
        except:
            latency = 0

        try:
            prompt_tokens = int(row["prompt_tokens"])
        except:
            prompt_tokens = 0

        try:
            response_tokens = int(row["response_tokens"])
        except:
            response_tokens = 0

        try:
            total_tokens = int(row["total_tokens"])
        except:
            total_tokens = prompt_tokens + response_tokens

        data[model].append({
            "latency": latency,
            "prompt_tokens": prompt_tokens,
            "response_tokens": response_tokens,
            "total_tokens": total_tokens
        })


print("\n========== MODEL PERFORMANCE ==========\n")

for model, rows in data.items():

    n = len(rows)

    avg_latency = sum(x["latency"] for x in rows) / n
    avg_prompt = sum(x["prompt_tokens"] for x in rows) / n
    avg_response = sum(x["response_tokens"] for x in rows) / n
    avg_total = sum(x["total_tokens"] for x in rows) / n

    print("Model:", model)
    print("Questions:", n)
    print(f"Average Latency: {avg_latency:.3f} seconds")
    print(f"Average Prompt Tokens: {avg_prompt:.2f}")
    print(f"Average Response Tokens: {avg_response:.2f}")
    print(f"Average Total Tokens: {avg_total:.2f}")
    print(f"Minimum Latency: {min(x['latency'] for x in rows):.3f} seconds")
    print(f"Maximum Latency: {max(x['latency'] for x in rows):.3f} seconds")
    print()
