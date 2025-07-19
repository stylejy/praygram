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
          return;
        }

        const response = await fetch(`/api/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (response.ok) {
          const group = await response.json();
          setGroupName(group.name);
        } else {
          console.error('Failed to fetch group:', response.status);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="glass-card p-8 rounded-3xl text-center slide-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="glass-card p-8 rounded-3xl text-center slide-up max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-600 mb-6">
            데이터를 불러오는 중 문제가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="primary-button px-6 py-3 rounded-xl font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-white">
      {/* Navigation */}
      <Navbar groupTitle={groupName} />

      {/* Main Content */}
      <main className="pt-24 px-4 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card p-6 rounded-2xl slide-up pulse-animation"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-32"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-20 fade-in">
              <PraygramLogo size="xl" className="mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                아직 등록된 기도제목이 없습니다
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                첫 번째 기도제목을 등록하여 기도모임을 시작해보세요!
              </p>
              <Link
                href={`/${groupId}/add`}
                className="primary-button inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-white"
              >
                <span className="text-xl">✨</span>
                <span>첫 기도제목 등록하기</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6 fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  기도제목 목록
                </h2>
                <p className="text-gray-600">
                  총 {prayers.length}개의 기도제목이 있습니다
                </p>
              </div>

              {prayers.map((prayer, index) => (
                <div
                  key={prayer.id}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Praycard prayer={prayer} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Desktop Floating Action Buttons */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col space-y-4 z-50">
        {/* Invite Button */}
        <div className="relative group">
          <button
            onClick={handleInvite}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="초대 링크 복사"
          >
            <FaShare
              size={18}
              className="text-white group-hover:rotate-12 transition-transform duration-300"
            />
          </button>

          {/* Button Label */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            초대하기
          </div>

          {/* Copy Success Toast */}
          {showCopySuccess && (
            <div className="absolute bottom-full mb-2 right-0 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap slide-up shadow-lg">
              초대 링크 복사됨! 📋
            </div>
          )}
        </div>

        {/* Add Prayer Button */}
        <div className="relative group">
          <Link
            href={`/${groupId}/add`}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="새 기도제목 등록"
          >
            <FaPlus
              size={20}
              className="text-white group-hover:rotate-90 transition-transform duration-300"
            />
          </Link>

          {/* Button Label */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            기도제목 등록
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex space-x-3">
          {/* Invite Button */}
          <div className="relative flex-1">
            <button
              onClick={handleInvite}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center space-x-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            >
              <FaShare size={16} />
              <span>초대하기</span>
            </button>

            {/* Copy Success Toast for Mobile */}
            {showCopySuccess && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap slide-up shadow-lg">
                초대 링크 복사됨! 📋
              </div>
            )}
          </div>

          {/* Add Prayer Button */}
          <div className="flex-1">
            <Link
              href={`/${groupId}/add`}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <FaPlus size={16} />
              <span>기도제목 등록</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
