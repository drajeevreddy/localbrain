import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { callLLM, callEmbedding } from '@/lib/llm/adapter'
import type { ProviderName } from '@/lib/llm/adapter'

function chunkText(text: string, chunkSize = 500, overlap = 100): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
    i += chunkSize - overlap
  }
  return chunks.filter((c) => c.trim().length > 0)
}

async function extractEntities(
  content: string,
  provider: ProviderName,
  apiKey: string
): Promise<Array<{ label: string; type: string }>> {
  try {
    const response = await callLLM(
      [
        {
          role: 'system',
          content:
            'Extract key concepts, entities, and tags from the text. Return ONLY a JSON array of objects with "label" (string) and "type" (one of: concept, entity, tag). Maximum 15 items. No explanation.',
        },
        { role: 'user', content },
      ],
      { provider, apiKey }
    )

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return []
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { title, content, provider, apiKey } = body as {
    title: string
    content: string
    provider: ProviderName
    apiKey: string
  }

  if (!content || !provider || !apiKey) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  // 1. Save note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({ user_id: user!.id, title: title || 'Untitled', content })
    .select()
    .single()

  if (noteError) {
    return Response.json({ error: noteError.message }, { status: 500 })
  }

  // 2. Chunk and embed
  const chunks = chunkText(content)
  const chunkInserts = []

  for (const chunkText_ of chunks) {
    try {
      const embedding = await callEmbedding(chunkText_, { provider, apiKey })
      chunkInserts.push({
        note_id: note.id,
        user_id: user!.id,
        content: chunkText_,
        embedding: JSON.stringify(embedding),
      })
    } catch {
      chunkInserts.push({
        note_id: note.id,
        user_id: user!.id,
        content: chunkText_,
        embedding: null,
      })
    }
  }

  if (chunkInserts.length > 0) {
    await supabase.from('chunks').insert(chunkInserts)
  }

  // 3. Extract entities and build graph
  const entities = await extractEntities(content, provider, apiKey)
  const nodeIds: string[] = []

  for (const entity of entities) {
    const { data: existing } = await supabase
      .from('graph_nodes')
      .select('id')
      .eq('user_id', user!.id)
      .ilike('label', entity.label)
      .single()

    if (existing) {
      nodeIds.push(existing.id)
    } else {
      const { data: newNode } = await supabase
        .from('graph_nodes')
        .insert({
          user_id: user!.id,
          label: entity.label,
          type: entity.type || 'concept',
        })
        .select()
        .single()

      if (newNode) nodeIds.push(newNode.id)
    }
  }

  // 4. Create edges between co-occurring concepts
  const edges: Array<{
    user_id: string
    source_node_id: string
    target_node_id: string
    relationship: string
    weight: number
  }> = []

  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      edges.push({
        user_id: user!.id,
        source_node_id: nodeIds[i],
        target_node_id: nodeIds[j],
        relationship: 'co_occurs_in',
        weight: 1.0,
      })
    }
  }

  if (edges.length > 0) {
    await supabase.from('graph_edges').insert(edges)
  }

  return Response.json({
    note,
    chunksCreated: chunkInserts.length,
    entitiesExtracted: entities.length,
    edgesCreated: edges.length,
  })
}
