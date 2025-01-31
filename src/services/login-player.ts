import supabase from '../supabase/client'

export async function loginPlayer({ name }: { name: string }) {
  return await supabase
    .from('players')
    .upsert([{ name }], { onConflict: 'name' })
    .select('id')
    .single()
}