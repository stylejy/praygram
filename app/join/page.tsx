'use client';
import { joinGroup } from '@/apis/members';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JoinPage() {
  const [groupId, setGroupId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleJoinButtonClick = async () => {
    if (!groupId || localStorage.getItem('id') === null) {
      return;
    }
    try {
      const response = await joinGroup(groupId, localStorage.getItem('id')!);
      if (response) {
        router.push(`/${groupId}`);
      }
    } catch (error) {
      if ((error as any).details.includes('Key is not present in table')) {
        setErrorMessage(
          '기도모임 아이디가 존재하지 않습니다! 다시한번 확인해 주세요!'
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="animate-fade-in glass-card w-full max-w-sm px-8 py-10 flex flex-col items-center gap-6">
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          기도모임 참여
        </h1>
        <p
          className="text-sm text-center leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          공유받은 기도모임 아이디를 입력하거나
          <br />
          클립보드에서 붙여넣기 해주세요
        </p>

        <div className="flex flex-col w-full gap-3">
          <input
            className="glass-input"
            id="groupId"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setErrorMessage('');
            }}
            placeholder="기도모임 아이디 입력"
          />

          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                setGroupId(text);
              });
              setErrorMessage('');
            }}
          >
            클립보드에서 붙여넣기
          </button>

          <button
            className="btn-primary mt-2"
            type="button"
            onClick={handleJoinButtonClick}
          >
            참여하기
          </button>

          {errorMessage && (
            <p className="text-sm text-center mt-1" style={{ color: '#ff3b30' }}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
