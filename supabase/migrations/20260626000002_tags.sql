CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b9eff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS note_tag_relations (
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES note_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tag_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tags" ON note_tags FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own tag relations" ON note_tag_relations FOR ALL USING (
  EXISTS (SELECT 1 FROM notes WHERE notes.id = note_id AND notes.user_id = auth.uid())
);
