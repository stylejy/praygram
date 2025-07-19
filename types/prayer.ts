export interface Prayer {
  id: string;
  title: string;
  content: string;
  group_id: string;
  author_id: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    nickname: string;
  };
  reactions?: Reaction[];
}

export interface CreatePrayerRequest {
  title: string;
  content: string;
  group_id: string;
  is_private?: boolean;
}

export interface UpdatePrayerRequest {
  title?: string;
  content?: string;
  is_private?: boolean;
}

export interface Reaction {
  id: string;
  prayer_id: string;
  user_id: string;
  type: 'pray' | 'amen';
  created_at: string;
  user?: {
    nickname: string;
  };
}

export interface PrayerWithReactions extends Prayer {
  reactions: Reaction[];
  reaction_count: number;
}
