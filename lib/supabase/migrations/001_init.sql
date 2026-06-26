CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'concept' CHECK (type IN ('concept', 'entity', 'tag')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'related_to',
  weight REAL NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_provider TEXT NOT NULL DEFAULT 'nvidia'
);

CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_chunks_note_id ON chunks(note_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_graph_nodes_user_id ON graph_nodes(user_id);
CREATE INDEX idx_graph_edges_user_id ON graph_edges(user_id);
CREATE UNIQUE INDEX idx_graph_nodes_user_label ON graph_nodes(user_id, lower(label));

CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own chunks" ON chunks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own graph_nodes" ON graph_nodes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own graph_edges" ON graph_edges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own user_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
