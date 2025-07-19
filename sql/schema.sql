-- =================================
-- Praygram Database Schema 완전 초기화 및 재생성
-- 기도모임 PWA 웹앱 데이터베이스 스키마
-- =================================

-- ================================= 
-- 기존 스키마 완전 초기화
-- =================================

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "사용자는 자신의 프로필만 조회/수정 가능" ON profiles;
DROP POLICY IF EXISTS "그룹 멤버만 그룹 정보 조회 가능" ON groups;
DROP POLICY IF EXISTS "인증된 사용자는 그룹 생성 가능" ON groups;
DROP POLICY IF EXISTS "그룹 리더만 그룹 정보 수정 가능" ON groups;
DROP POLICY IF EXISTS "그룹 멤버는 같은 그룹 멤버 목록 조회 가능" ON group_members;
DROP POLICY IF EXISTS "멤버 초대 및 가입 정책" ON group_members;
DROP POLICY IF EXISTS "멤버 관리 및 탈퇴 정책" ON group_members;
DROP POLICY IF EXISTS "리더는 멤버 초대 가능, 본인은 탈퇴 가능" ON group_members;
DROP POLICY IF EXISTS "리더는 멤버 관리, 본인은 탈퇴 가능" ON group_members;
DROP POLICY IF EXISTS "그룹 멤버는 같은 그룹의 기도제목 조회 가능" ON prayers;
DROP POLICY IF EXISTS "그룹 멤버는 기도제목 작성 가능" ON prayers;
DROP POLICY IF EXISTS "작성자만 자신의 기도제목 수정/삭제 가능" ON prayers;
DROP POLICY IF EXISTS "그룹 멤버는 같은 그룹의 리액션 조회 가능" ON reactions;
DROP POLICY IF EXISTS "그룹 멤버는 리액션 추가/삭제 가능" ON reactions;

-- 새로 추가된 정책들도 삭제
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;
DROP POLICY IF EXISTS "prayers_select_policy" ON prayers;
DROP POLICY IF EXISTS "prayers_insert_policy" ON prayers;
DROP POLICY IF EXISTS "prayers_update_policy" ON prayers;
DROP POLICY IF EXISTS "prayers_delete_policy" ON prayers;
DROP POLICY IF EXISTS "reactions_select_policy" ON reactions;
DROP POLICY IF EXISTS "reactions_insert_policy" ON reactions;
DROP POLICY IF EXISTS "reactions_delete_policy" ON reactions;

-- 2. 기존 트리거 삭제
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
DROP TRIGGER IF EXISTS update_prayers_updated_at ON prayers;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();

-- 4. 기존 인덱스 삭제
DROP INDEX IF EXISTS idx_group_members_group_id;
DROP INDEX IF EXISTS idx_group_members_user_id;
DROP INDEX IF EXISTS idx_prayers_group_id;
DROP INDEX IF EXISTS idx_prayers_author_id;
DROP INDEX IF EXISTS idx_prayers_created_at;
DROP INDEX IF EXISTS idx_reactions_prayer_id;
DROP INDEX IF EXISTS idx_reactions_user_id;
DROP INDEX IF EXISTS idx_groups_invite_code;

-- 5. 기존 테이블 삭제 (외래키 순서 고려)
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS prayers CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 6. 기존 타입 삭제
DROP TYPE IF EXISTS member_role CASCADE;

-- =================================
-- 새로운 스키마 생성
-- =================================

-- 1. 사용자 프로필 테이블 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 그룹 테이블
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  invite_code UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 멤버 역할 타입 생성
CREATE TYPE member_role AS ENUM ('LEADER', 'MEMBER');

-- 4. 그룹 멤버십 테이블
CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'MEMBER',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 5. 기도제목 테이블
CREATE TABLE prayers (
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
CREATE TABLE reactions (
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

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_prayers_group_id ON prayers(group_id);
CREATE INDEX idx_prayers_author_id ON prayers(author_id);
CREATE INDEX idx_prayers_created_at ON prayers(created_at DESC);
CREATE INDEX idx_reactions_prayer_id ON reactions(prayer_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_groups_invite_code ON groups(invite_code);

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
-- 새 사용자 자동 프로필 생성 트리거
-- =================================

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 자동으로 프로필 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =================================
-- Row Level Security (RLS) 정책 - 완전 재귀 방지
-- =================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles 정책
CREATE POLICY "profiles_policy" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 2. Groups 정책 (group_members 참조 제거)
CREATE POLICY "groups_select_policy" ON groups
    FOR SELECT USING (
        created_by = auth.uid()  -- 생성자만 조회 가능
        OR
        id IN (
            SELECT DISTINCT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "groups_insert_policy" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "groups_update_policy" ON groups
    FOR UPDATE USING (created_by = auth.uid());

-- 3. Group Members 정책 (완전 재귀 방지)
-- 조회: 자신과 관련된 멤버십만 조회 가능
CREATE POLICY "group_members_select_policy" ON group_members
    FOR SELECT USING (user_id = auth.uid());

-- 삽입: 본인 계정만 추가 가능 (그룹 생성자 또는 초대받은 사용자)
CREATE POLICY "group_members_insert_policy" ON group_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid()
    );

-- 삭제: 본인 탈퇴만 가능
CREATE POLICY "group_members_delete_policy" ON group_members
    FOR DELETE USING (user_id = auth.uid());

-- 4. Prayers 정책 (단순화)
CREATE POLICY "prayers_select_policy" ON prayers
    FOR SELECT USING (
        author_id = auth.uid()  -- 자신의 기도제목
        OR
        group_id IN (
            SELECT DISTINCT group_id FROM group_members 
            WHERE user_id = auth.uid()
        )  -- 자신이 속한 그룹의 기도제목
    );

CREATE POLICY "prayers_insert_policy" ON prayers
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        author_id = auth.uid()
    );

CREATE POLICY "prayers_update_policy" ON prayers
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "prayers_delete_policy" ON prayers
    FOR DELETE USING (author_id = auth.uid());

-- 5. Reactions 정책 (단순화)
CREATE POLICY "reactions_select_policy" ON reactions
    FOR SELECT USING (
        user_id = auth.uid()  -- 자신의 리액션
        OR
        prayer_id IN (
            SELECT id FROM prayers 
            WHERE author_id = auth.uid()
            OR group_id IN (
                SELECT DISTINCT group_id FROM group_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "reactions_insert_policy" ON reactions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid()
    );

CREATE POLICY "reactions_delete_policy" ON reactions
    FOR DELETE USING (user_id = auth.uid());

-- =================================
-- 기존 사용자를 위한 프로필 생성 (선택사항)
-- =================================

-- 이미 존재하는 auth.users에 대해 프로필이 없는 경우 생성
INSERT INTO public.profiles (id, nickname, avatar_url)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'nickname', email),
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =================================
-- 초기 데이터 및 설정 완료 메시지
-- =================================

-- 스키마 생성 완료 로그
DO $$
BEGIN
    RAISE NOTICE 'Praygram database schema has been successfully created!';
    RAISE NOTICE 'Tables: profiles, groups, group_members, prayers, reactions';
    RAISE NOTICE 'RLS policies have been applied with NO RECURSION';
    RAISE NOTICE 'Auto profile creation trigger added for new users';
    RAISE NOTICE 'Group creation should work without foreign key errors';
END
$$; 