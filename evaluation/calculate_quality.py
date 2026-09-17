import pandas as pd

FILE = "evaluation/manual_scores.csv"

df = pd.read_csv(FILE)

summary = df.groupby("model").agg(
    questions=("question_id", "count"),
    accuracy=("correct", "mean"),
    relevance=("relevant", "mean"),
    retrieval_quality=("retrieval_good", "mean"),
    hallucination_rate=("hallucination", "mean")
)

summary["accuracy"] *= 100
summary["relevance"] *= 100
summary["retrieval_quality"] *= 100
summary["hallucination_rate"] *= 100

print("\n========== QUALITY EVALUATION ==========\n")

print(summary.round(2))
