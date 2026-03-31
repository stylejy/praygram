'use client';

import { useEffect, useState } from 'react';
import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus, FaShare } from 'react-icons/fa';
import Link from 'next/link';
import { useRealtimePrayers } from '@/hooks/useRealtimePrayers';
import { useRealtimeReactions } from '@/hooks/useRealtimeReactions';
import { createSupabaseBrowserClient } from '@/lib/supabase';
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center slide-up max-w-sm mx-4">
          <p className="text-gray-700 mb-6">데이터를 불러오는 중 문제가 발생했습니다.</p>
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
      <main className="pt-24 px-4 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20 fade-in">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="loading-spinner"></div>
              </div>
              <p className="text-gray-500 text-sm">기도제목을 불러오는 중...</p>
            </div>
          ) : prayers && prayers.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <p className="text-gray-500 mb-6">아직 등록된 기도제목이 없습니다</p>
              <Link
                href={`/${groupId}/add`}
                className="primary-button inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium text-white"
              >
                <FaPlus size={14} />
                <span>첫 기도제목 등록하기</span>
              </Link>
            </div>
          ) : prayers ? (
            <div className="space-y-6 fade-in">
              <p className="text-center text-sm text-gray-500 mb-2">
                총 {prayers.length}개의 기도제목
              </p>
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
            <FaShare size={16} className="text-gray-600" />
          </button>
          {showCopySuccess && (
            <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap slide-up">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="glass-navbar rounded-2xl p-3 flex space-x-3">
          <div className="relative flex-1">
            <button
              onClick={handleInvite}
              className="glass-button w-full py-3 rounded-xl font-medium text-gray-700 flex items-center justify-center space-x-2"
            >
              <FaShare size={14} />
              <span>초대하기</span>
            </button>
            {showCopySuccess && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap slide-up">
                초대 링크 복사됨!
              </div>
            )}
          </div>
          <Link
            href={`/${groupId}/add`}
            className="primary-button flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center space-x-2"
          >
            <FaPlus size={14} />
            <span>기도제목 등록</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
