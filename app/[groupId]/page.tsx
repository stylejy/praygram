'use client';

import { useEffect, useState } from 'react';
import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus, FaShare } from 'react-icons/fa';
import Link from 'next/link';
import { useRealtimePrayers } from '@/hooks/useRealtimePrayers';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { PraygramLogo } from '@/app/components/PraygramLogo';
interface Props {
  params: Promise<{ groupId: string }>;
}

export default function GroupHome({ params }: Props) {
  const [groupId, setGroupId] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('로딩 중...');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // params 해결
  useEffect(() => {
    params.then(({ groupId }) => {
      setGroupId(groupId);
    });
  }, [params]);

  // 실시간 구독 훅 사용
  const { prayers, isLoading, error } = useRealtimePrayers(groupId);
  useRealtimeReactions(groupId);

  // 초대 기능
  const handleInvite = async () => {
    console.log('초대 링크 생성 - 현재 groupId:', groupId);
    const inviteUrl = `${window.location.origin}/join/${groupId}`;
    console.log('생성된 초대 링크:', inviteUrl);

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 폴백: 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  // 그룹 정보 가져오기
  useEffect(() => {
    if (!groupId) return;

    const fetchGroupInfo = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session?.access_token) {
          console.error('No access token available');
          setGroupName('인증 필요');
          return;
        }

        console.log('그룹 정보 요청:', groupId);
        const response = await fetch(`/api/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (response.ok) {
          const group = await response.json();
          console.log('그룹 정보 응답:', group);
          setGroupName(group.name || '이름 없음');
        } else {
          console.error('Failed to fetch group:', response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error data:', errorData);
          setGroupName('그룹 정보 없음');
        }
      } catch (error) {
        console.error('그룹 정보 로드 실패:', error);
        setGroupName('로드 실패');
      }
    };

    fetchGroupInfo();
  }, [groupId]);

  if (!groupId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center slide-up">
          <PraygramLogo size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-[color:var(--text-muted)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center slide-up max-w-sm mx-4">
          <p className="mb-6 text-[color:var(--text-secondary)]">데이터를 불러오는 중 문제가 발생했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="primary-button px-6 py-3 rounded-xl font-medium text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Navigation */}
      <Navbar groupTitle={groupName} />

      {/* Main Content */}
      <main className="pt-24 px-4 pb-36 md:pb-0">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20 fade-in">
              <PraygramLogo size="lg" className="mx-auto mb-4" />
              <p className="text-sm text-[color:var(--text-muted)]">기도제목을 불러오는 중...</p>
            </div>
          ) : prayers && prayers.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <p className="mb-6 text-[color:var(--text-muted)]">아직 등록된 기도제목이 없습니다</p>
              <Link
                href={`/${groupId}/add`}
                className="primary-button inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium text-white"
              >
                <FaPlus size={14} />
                <span>첫 기도제목 등록하기</span>
              </Link>
            </div>
          ) : prayers ? (
            <div className="space-y-4 fade-in">
              <div className="mb-4 flex items-end justify-between px-1">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                    기도제목
                  </p>
                  <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                    {prayers.length}개의 마음이 올라왔어요
                  </p>
                </div>
                <span className="text-xs text-[color:var(--text-muted)]">
                  최근 순
                </span>
              </div>
              {prayers.map((prayer, index) => (
                <div
                  key={prayer.id}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <Praycard prayer={prayer} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>

      {/* Desktop FAB */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col space-y-3 z-50">
        <div className="relative">
          <button
            onClick={handleInvite}
            className="glass-button w-14 h-14 rounded-full flex items-center justify-center"
            title="초대하기"
          >
            <FaShare size={16} className="text-[color:var(--text-secondary)]" />
          </button>
          {showCopySuccess && (
            <div className="absolute bottom-full mb-2 right-0 rounded-lg bg-[color:var(--text-primary)] px-3 py-2 text-sm text-white whitespace-nowrap slide-up">
              초대 링크 복사됨!
            </div>
          )}
        </div>
        <Link
          href={`/${groupId}/add`}
          className="primary-button w-14 h-14 rounded-full flex items-center justify-center"
          title="기도제목 등록"
        >
          <FaPlus size={18} className="text-white" />
        </Link>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-[rgba(247,243,237,0.96)] via-[rgba(247,243,237,0.82)] to-transparent px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 md:hidden">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-lg border border-[color:var(--accent-border)] bg-[rgba(255,253,248,0.92)] p-1.5 shadow-[0_10px_28px_rgba(74,57,128,0.12)] backdrop-blur-md">
          <div className="relative min-w-0 flex-[0.9]">
            <button
              onClick={handleInvite}
              className="flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-[color:var(--accent-border)] bg-white/75 px-2 text-[13px] font-semibold text-[color:var(--text-secondary)] shadow-sm transition active:scale-[0.99]"
            >
              <FaShare size={13} className="shrink-0" />
              <span className="truncate">초대하기</span>
            </button>
            {showCopySuccess && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-lg bg-[color:var(--text-primary)] px-3 py-2 text-sm text-white whitespace-nowrap slide-up">
                초대 링크 복사됨!
              </div>
            )}
          </div>
          <Link
            href={`/${groupId}/add`}
            className="primary-button flex h-10 min-w-0 flex-[1.1] items-center justify-center gap-1.5 rounded-md px-2 text-[13px] font-semibold text-white transition active:scale-[0.99]"
          >
            <FaPlus size={13} className="shrink-0" />
            <span className="truncate">기도제목 등록</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
