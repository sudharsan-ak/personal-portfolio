"""
Eval harness for the portfolio RAG assistant.

Sends each Q&A pair to the local RAG service, then asks Claude Haiku
to score the response 1–5 against the expected answer.

Usage:
    # Make sure rag-service is running: uvicorn main:app --reload
    python evals/run_eval.py

Environment variables (add to .env or export):
    RAG_SERVICE_URL   — defaults to http://localhost:8000
    ANTHROPIC_API_KEY — required for Claude Haiku scoring
"""

import json
import os
import httpx
import anthropic
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://localhost:8000")
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
QA_PATH = Path(__file__).parent / "qa_pairs.json"


def ask_rag(question: str) -> str:
    """Send a question to the RAG service and collect the full streamed response."""
    payload = {"messages": [{"role": "user", "content": question}]}
    with httpx.stream("POST", f"{RAG_SERVICE_URL}/chat", json=payload, timeout=30) as r:
        r.raise_for_status()
        return "".join(r.iter_text())


def score_response(question: str, expected: str, actual: str, client: anthropic.Anthropic) -> dict:
    """Ask Claude Haiku to score the actual response 1–5 vs the expected answer."""
    prompt = f"""You are evaluating an AI assistant's answer for factual accuracy.

Question: {question}
Expected answer: {expected}
Actual answer: {actual}

Score the actual answer from 1 to 5:
5 = Fully correct and complete
4 = Mostly correct, minor omissions
3 = Partially correct
2 = Mostly wrong but has some relevant info
1 = Completely wrong or hallucinated

Reply with ONLY a JSON object in this format:
{{"score": <1-5>, "reason": "<one sentence>"}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=150,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    return json.loads(raw)


def main():
    qa_pairs = json.loads(QA_PATH.read_text())
    anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    results = []
    total_score = 0

    print(f"Running eval on {len(qa_pairs)} questions...\n")

    for i, pair in enumerate(qa_pairs, 1):
        question = pair["question"]
        expected = pair["expected"]

        print(f"[{i}/{len(qa_pairs)}] {question}")

        actual = ask_rag(question)
        scored = score_response(question, expected, actual, anthropic_client)

        score = scored["score"]
        total_score += score
        results.append({
            "question": question,
            "expected": expected,
            "actual": actual,
            "score": score,
            "reason": scored["reason"],
        })

        print(f"  Score: {score}/5 — {scored['reason']}\n")

    avg = total_score / len(qa_pairs)
    print(f"{'='*60}")
    print(f"Average score: {avg:.2f} / 5.00  ({len(qa_pairs)} questions)")
    print(f"{'='*60}\n")

    # write full results to file
    out_path = Path(__file__).parent / "eval_results.json"
    out_path.write_text(json.dumps(results, indent=2))
    print(f"Full results written to {out_path}")


if __name__ == "__main__":
    main()
