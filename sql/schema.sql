-- =================================
-- Praygram Database Schema
-- 기도모임 PWA 웹앱 데이터베이스 스키마
-- =================================

-- 1. 사용자 프로필 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 그룹 테이블
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  invite_code UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 멤버 역할 타입 생성
DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('LEADER', 'MEMBER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. 그룹 멤버십 테이블
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'MEMBER',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 5. 기도제목 테이블
CREATE TABLE IF NOT EXISTS prayers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 500),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 리액션 테이블
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prayer_id UUID REFERENCES prayers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'pray' CHECK (type IN ('pray', 'amen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_id, user_id, type)
);

-- =================================
-- 성능 최적화 인덱스
-- =================================

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_group_id ON prayers(group_id);
CREATE INDEX IF NOT EXISTS idx_prayers_author_id ON prayers(author_id);
CREATE INDEX IF NOT EXISTS idx_prayers_created_at ON prayers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_prayer_id ON reactions(prayer_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- =================================
-- 트리거 (updated_at 자동 관리)
-- =================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON prayers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================
-- Row Level Security (RLS) 정책
-- =================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles 정책
CREATE POLICY "사용자는 자신의 프로필만 조회/수정 가능" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 2. Groups 정책
CREATE POLICY "그룹 멤버만 그룹 정보 조회 가능" ON groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "인증된 사용자는 그룹 생성 가능" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "그룹 리더만 그룹 정보 수정 가능" ON groups
    FOR UPDATE USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role = 'LEADER'
        )
    );

-- 3. Group Members 정책
CREATE POLICY "그룹 멤버는 같은 그룹 멤버 목록 조회 가능" ON group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "리더는 멤버 초대 가능, 본인은 탈퇴 가능" ON group_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (
            group_id IN (
                SELECT group_id FROM group_members 
                WHERE user_id = auth.uid() AND role = 'LEADER'
            )
            OR 
            user_id = auth.uid()
        )
    );

CREATE POLICY "리더는 멤버 관리, 본인은 탈퇴 가능" ON group_members
    FOR DELETE USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role = 'LEADER'
        )
        OR user_id = auth.uid()
    );

-- 4. Prayers 정책
CREATE POLICY "그룹 멤버는 같은 그룹의 기도제목 조회 가능" ON prayers
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "그룹 멤버는 기도제목 작성 가능" ON prayers
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "작성자만 자신의 기도제목 수정/삭제 가능" ON prayers
    FOR ALL USING (author_id = auth.uid());

-- 5. Reactions 정책
CREATE POLICY "그룹 멤버는 같은 그룹의 리액션 조회 가능" ON reactions
    FOR SELECT USING (
        prayer_id IN (
            SELECT p.id FROM prayers p
            JOIN group_members gm ON p.group_id = gm.group_id
            WHERE gm.user_id = auth.uid()
        )
    );

CREATE POLICY "그룹 멤버는 리액션 추가/삭제 가능" ON reactions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        prayer_id IN (
            SELECT p.id FROM prayers p
            JOIN group_members gm ON p.group_id = gm.group_id
            WHERE gm.user_id = auth.uid()
        )
    ); 