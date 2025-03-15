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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="flex flex-col w-auto px-11 items-center justify-center gap-4">
        <label
          className="text-gray-500 font-bold text-center"
          htmlFor="groupId"
        >
          공유받은 기도모임 아이디를 입력해 주세요! <br />
          (기도모임 아이디를 복사하기 한 다음 오른쪽 붙여넣기 버튼을 누르셔도
          됩니다)
        </label>
        <input
          className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          id="groupId"
          value={groupId}
          onChange={(e) => {
            setGroupId(e.target.value);
            setErrorMessage('');
          }}
          placeholder="여기에 입력해 주세요"
        />

        <button
          className="shadow w-full bg-slate-400 hover:bg-slate-400 focus:shadow-outline focus:outline-none text-white font-bold rounded"
          type="button"
          onClick={() => {
            navigator.clipboard.readText().then((text) => {
              setGroupId(text);
            });
            setErrorMessage('');
          }}
        >
          붙여넣기
        </button>
        <button
          className="shadow w-full bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded mt-6"
          type="button"
          onClick={handleJoinButtonClick}
        >
          참여하기
        </button>
        <span className="text-red-500">{errorMessage}</span>
      </div>
    </div>
  );
}
