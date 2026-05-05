'use client';
import { createGroup, joinGroupSmart } from '@/apis/groups';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { FaLink, FaPlus } from 'react-icons/fa';
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
    <main className="page-shell flex items-center justify-center">
      <section className="content-panel max-w-md fade-in">
        <div className="mb-6 flex items-start gap-3">
          <PraygramLogo size="md" className="mt-0.5" />
          <div className="min-w-0">
            <p className="section-eyebrow">Praygram</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              초대 링크로 참여하거나 새 모임을 만드세요
            </h1>
          </div>
        </div>

        {/* Tab */}
        <div className="mb-5 flex overflow-hidden rounded-lg border border-[color:var(--accent-border)] bg-white/45 p-1">
          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'join'
                ? 'bg-white text-[color:var(--text-primary)] shadow-sm'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
            }`}
          >
            <FaLink size={12} />
            참여하기
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-white text-[color:var(--text-primary)] shadow-sm'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]'
            }`}
          >
            <FaPlus size={12} />
            모임 만들기
          </button>
        </div>

        {errorMessage && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {activeTab === 'join' ? (
          <div className="flex flex-col gap-3">
            <label className="field-label">초대 링크</label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                setErrorMessage('');
              }}
              placeholder="초대 링크 또는 아이디 입력"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              disabled={isLoading}
            />
            <button
              onClick={handlePasteClick}
              disabled={isLoading}
              className="glass-button w-full rounded-lg py-2.5 text-sm font-medium text-[color:var(--text-secondary)] disabled:opacity-50"
            >
              클립보드에서 붙여넣기
            </button>
            <button
              onClick={handleJoinButtonClick}
              disabled={isLoading || !groupId.trim()}
              className="primary-button mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? '참여 중...' : '참여하기'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label className="field-label">새 기도모임</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="기도모임 이름"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={50}
              disabled={isLoading}
            />
            <button
              onClick={handleCreateButtonClick}
              disabled={isLoading || !groupName.trim()}
              className="primary-button mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading && <LoadingSpinner />}
              {isLoading ? '생성 중...' : '모임 만들기'}
            </button>
          </div>
        )}

        <button
          onClick={() => router.push('/groups')}
          className="mt-5 w-full text-center text-xs font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]"
        >
          그룹 목록으로 돌아가기
        </button>
      </section>
    </main>
  );
}
