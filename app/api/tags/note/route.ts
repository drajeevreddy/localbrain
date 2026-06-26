import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { noteId, tagId } = body as { noteId: string; tagId: string }

  if (!noteId || !tagId) return Response.json({ error: 'Missing noteId or tagId' }, { status: 400 })

  const supabase = await createClient()

  const { error: insertError } = await supabase
    .from('note_tag_relations')
    .insert({ note_id: noteId, tag_id: tagId })

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
  return Response.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { noteId, tagId } = body as { noteId: string; tagId: string }

  if (!noteId || !tagId) return Response.json({ error: 'Missing noteId or tagId' }, { status: 400 })

  const supabase = await createClient()
  const { error: delError } = await supabase
    .from('note_tag_relations')
    .delete()
    .eq('note_id', noteId)
    .eq('tag_id', tagId)

  if (delError) return Response.json({ error: delError.message }, { status: 500 })
  return Response.json({ success: true })
}
