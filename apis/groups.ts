import { createSupabaseBrowserClient } from '@/lib/supabase';

interface Group {
  name: string;
}
export const getGroup = async (groupId: string) => {
  const supabase = createSupabaseBrowserClient();
  const result = await supabase.from('groups').select('*').eq('id', groupId);

  return (result.data as unknown as Group[])[0];
};
