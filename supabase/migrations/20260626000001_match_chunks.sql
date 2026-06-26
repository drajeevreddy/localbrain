CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  user_id_input uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  note_id uuid,
  notes jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    c.note_id,
    jsonb_build_object('title', n.title) AS notes
  FROM chunks c
  LEFT JOIN notes n ON c.note_id = n.id
  WHERE (user_id_input IS NULL OR c.user_id = user_id_input)
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
