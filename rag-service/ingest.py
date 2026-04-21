"""
Ingest markdown files from data/ into Supabase pgvector.

Run once (or after updating data files):
    python ingest.py

Chunks each markdown file into ~500 character segments, embeds them with
sentence-transformers all-MiniLM-L6-v2, and upserts into the
portfolio_chunks table in Supabase.
"""

import os
import re
from pathlib import Path
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
DATA_DIR = Path(__file__).parent.parent / "data"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks by character count, breaking at word boundaries."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        if end < len(text):
            # walk back to last whitespace so we don't cut mid-word
            while end > start and not text[end].isspace():
                end -= 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    return chunks


def load_markdown_files(data_dir: Path) -> list[dict]:
    """Recursively load all .md files, returning list of {source, content} dicts."""
    docs = []
    for md_file in data_dir.rglob("*.md"):
        relative = md_file.relative_to(data_dir.parent)
        content = md_file.read_text(encoding="utf-8")
        docs.append({"source": str(relative), "content": content})
    return docs


def main():
    print("Loading embedding model (downloads ~80MB on first run)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    docs = load_markdown_files(DATA_DIR)
    print(f"Loaded {len(docs)} markdown files from {DATA_DIR}")

    rows = []
    for doc in docs:
        chunks = chunk_text(doc["content"])
        for i, chunk in enumerate(chunks):
            embedding = model.encode(chunk).tolist()
            rows.append({
                "source": doc["source"],
                "chunk_index": i,
                "content": chunk,
                "embedding": embedding,
            })

    print(f"Upserting {len(rows)} chunks into Supabase...")

    # delete existing rows for these sources so re-ingestion is idempotent
    sources = list({r["source"] for r in rows})
    supabase.table("portfolio_chunks").delete().in_("source", sources).execute()

    # batch insert in groups of 100
    batch_size = 100
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        supabase.table("portfolio_chunks").insert(batch).execute()
        print(f"  inserted rows {i + 1}–{min(i + batch_size, len(rows))}")

    print("Ingestion complete.")


if __name__ == "__main__":
    main()
