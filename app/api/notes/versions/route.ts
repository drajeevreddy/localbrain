import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const noteId = searchParams.get('noteId')

  if (!noteId) return Response.json({ error: 'Missing noteId' }, { status: 400 })

  const supabase = await createClient()

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id, title, content, created_at')
    .eq('id', noteId)
    .eq('user_id', user!.id)
    .single()

  if (noteError) return Response.json({ error: noteError.message }, { status: 500 })

  return Response.json({ versions: note ? [note] : [] })
}
