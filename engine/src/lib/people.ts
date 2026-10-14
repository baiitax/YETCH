import type { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type Person = { id: string; full_name: string; email: string; role: string; is_active: boolean };

/** Active staff, for owner and assignee pickers. Visible to any active user through RLS. */
export async function loadPeople(supabase: Supabase): Promise<Person[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .eq('is_active', true)
    .order('full_name', { ascending: true });
  return (data ?? []) as Person[];
}

export function nameOf(people: Person[], id: string | null | undefined): string {
  if (!id) return 'Unassigned';
  const p = people.find((x) => x.id === id);
  return p ? p.full_name || p.email : 'Former staff';
}
