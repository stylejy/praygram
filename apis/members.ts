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

export const joinGroup = async (groupId: string, memberId: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('members')
    .update({ group: groupId })
    .eq('id', memberId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};
