import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const supabase = await createClient()
  const { data, error: fetchError } = await supabase
    .from('note_tags')
    .select('*')
    .eq('user_id', user!.id)
    .order('name')

  if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 })
  return Response.json({ tags: data ?? [] })
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { name, color } = body as { name: string; color?: string }

  if (!name) return Response.json({ error: 'Missing name' }, { status: 400 })

  const supabase = await createClient()
  const { data, error: insertError } = await supabase
    .from('note_tags')
    .insert({ user_id: user!.id, name: name.trim(), color: color || '#3b9eff' })
    .select()
    .single()

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
  return Response.json({ tag: data })
}

export async function DELETE(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { tagId } = body as { tagId: string }

  if (!tagId) return Response.json({ error: 'Missing tagId' }, { status: 400 })

  const supabase = await createClient()
  const { error: delError } = await supabase
    .from('note_tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', user!.id)

  if (delError) return Response.json({ error: delError.message }, { status: 500 })
  return Response.json({ success: true })
}
