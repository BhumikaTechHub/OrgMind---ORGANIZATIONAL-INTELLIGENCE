import pandas as pd

results = pd.read_csv("evaluation/results.csv")

columns = [
    "question_id",
    "category",
    "question",
    "model",
    "answer",
    "context"
]

df = results[columns].copy()

df["correct"] = ""
df["relevant"] = ""
df["retrieval_good"] = ""
df["hallucination"] = ""

df.to_csv(
    "evaluation/scoring_sheet.csv",
    index=False,
    encoding="utf-8"
)

print("Scoring sheet created!")
print("Rows:", len(df))
print("File: evaluation/scoring_sheet.csv")
