import { createSupabaseBrowserClient } from '@/lib/supabase';

export const getMembers = async (id: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase.from('members').select('*').eq('id', id);

  return result.data;
};

export const createMembers = async (nickname: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase.from('members').insert([{ nickname }]).select();

  return result.data;
};
