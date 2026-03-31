'use client';
import { joinGroup } from '@/apis/members';
import { createGroup, joinGroupSmart } from '@/apis/groups';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PraygramLogo } from '@/app/components/PraygramLogo';

export default function JoinPage() {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinButtonClick = async () => {
    if (!groupId || localStorage.getItem('id') === null) {
      setErrorMessage('초대 링크를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 스마트 그룹 참여 (그룹 ID 또는 초대 코드 자동 감지)
      const response = await joinGroupSmart(groupId);
      if (response) {
        // 로컬스토리지 업데이트
        localStorage.setItem('group', response.groupId);
        localStorage.setItem(
          'isManager',
          response.role === 'LEADER' ? 'true' : 'false'
        );

        router.push(`/${response.groupId}`);
      }
    } catch (error) {
      console.error('그룹 참여 실패:', error);
      setErrorMessage(
        '기도모임을 찾을 수 없거나 참여할 수 없습니다. 초대 링크를 다시 확인해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateButtonClick = async () => {
    if (!groupName.trim()) {
      setErrorMessage('기도모임 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await createGroup(groupName.trim());
      if (response) {
        // 로컬스토리지 업데이트
        localStorage.setItem('group', response.id);
        localStorage.setItem('isManager', 'true');

        router.push(`/${response.id}`);
      }
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      setErrorMessage('기도모임 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();

      // 링크에서 그룹 ID 추출 시도
      const extractedId = extractGroupIdFromText(text);
      setGroupId(extractedId);
      setErrorMessage('');
    } catch (error) {
      console.error('클립보드 읽기 실패:', error);
      setErrorMessage('클립보드 읽기에 실패했습니다.');
    }
  };

  // 텍스트에서 그룹 ID 또는 초대 코드 추출
  const extractGroupIdFromText = (text: string): string => {
    const trimmedText = text.trim();
    console.log('원본 텍스트:', trimmedText);

    // 초대 링크 패턴 확인 (/join/{groupId})
    const uuidRegex =
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    const linkMatch = trimmedText.match(
      new RegExp(`/join/(${uuidRegex.source})`, 'i')
    );
    if (linkMatch) {
      console.log('링크에서 추출된 그룹 ID:', linkMatch[1]);
      return linkMatch[1]; // 그룹 ID 반환
    }

    // URL에서 그룹 ID 추출 시도
    try {
      const url = new URL(trimmedText);
      console.log('URL 파싱 성공:', url.pathname);
      const pathMatch = url.pathname.match(
        new RegExp(`/join/(${uuidRegex.source})`, 'i')
      );
      if (pathMatch) {
        console.log('URL에서 추출된 그룹 ID:', pathMatch[1]);
        return pathMatch[1];
      }
    } catch (error) {
      console.log('URL 파싱 실패:', error);
    }

    // UUID 형태인지 확인 (초대 코드)
    const uuidPattern =
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (uuidPattern.test(trimmedText)) {
      console.log('UUID 패턴 매치:', trimmedText);
      return trimmedText;
    }

    console.log('패턴 매치 실패, 원본 반환:', trimmedText);
    // 그 외의 경우 원본 텍스트 반환
    return trimmedText;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="glass-card w-full max-w-sm px-8 py-10 flex flex-col gap-6 fade-in rounded-3xl">
        <h1 className="text-2xl font-light tracking-tight text-gray-900 text-center">
          기도모임
        </h1>

        {/* Tab */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200/60">
          <button
            onClick={() => { setActiveTab('join'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'join'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            참여하기
          </button>
          <button
            onClick={() => { setActiveTab('create'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            모임 만들기
          </button>
        </div>

        {errorMessage && (
          <p className="text-sm text-center text-red-500">{errorMessage}</p>
        )}

        {activeTab === 'join' ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={groupId}
              onChange={(e) => { setGroupId(e.target.value); setErrorMessage(''); }}
              placeholder="초대 링크 또는 아이디 입력"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handlePasteClick}
              disabled={isLoading}
              className="glass-button w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-50"
            >
              클립보드에서 붙여넣기
            </button>
            <button
              onClick={handleJoinButtonClick}
              disabled={isLoading || !groupId.trim()}
              className="primary-button w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? '참여 중...' : '참여하기'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="기도모임 이름"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              maxLength={50}
              disabled={isLoading}
            />
            <button
              onClick={handleCreateButtonClick}
              disabled={isLoading || !groupName.trim()}
              className="success-button w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? '생성 중...' : '모임 만들기'}
            </button>
          </div>
        )}

        <button
          onClick={() => router.push('/groups')}
          className="text-xs text-gray-400 hover:text-gray-600 text-center mt-2"
        >
          그룹 목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
