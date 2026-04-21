-- Run this once in your Supabase SQL editor to set up pgvector for the RAG service.

-- 1. Enable the pgvector extension
create extension if not exists vector;

-- 2. Create the chunks table
create table if not exists portfolio_chunks (
  id          bigserial primary key,
  source      text not null,        -- e.g. "data/resume.md"
  chunk_index integer not null,     -- position within the source file
  content     text not null,        -- raw text of this chunk
  embedding   vector(384)           -- all-MiniLM-L6-v2 produces 384-dim vectors
);

-- 3. Create an IVFFlat index for fast approximate nearest-neighbour search
--    (build after ingestion once you have rows)
create index if not exists portfolio_chunks_embedding_idx
  on portfolio_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- 4. Similarity search function called by the Python service
create or replace function match_portfolio_chunks(
  query_embedding vector(384),
  match_threshold float,
  match_count     int
)
returns table (
  id      bigint,
  source  text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    source,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from portfolio_chunks
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
