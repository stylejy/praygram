import { createSupabaseBrowserClient } from '@/lib/supabase';

interface Reaction {
  prayCount: number;
}

interface Prayer {
  id: string;
  prayer: string;
  edited_at: string;
  reaction: Reaction | null;
  user: {
    nickname: string;
  };
}
export const getGroupPrayers = async (groupId: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase
    .from('prayers')
    .select('id, prayer, reaction, edited_at, user(nickname)')
    .eq('group', groupId);

  return result.data as unknown as Prayer[];
};

export const getMyPrayers = async (userId: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase.from('prayers').select('*').eq('user', userId);

  return result.data;
};

export const createPrayers = async (groupId: string, prayer: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase
    .from('prayers')
    .insert([{ group: groupId, prayer }])
    .select();

  return result.data;
};
