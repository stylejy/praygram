'use client';
import { joinGroup } from '@/apis/members';
import { createGroup, joinGroupByInviteCode } from '@/apis/groups';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JoinPage() {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleJoinButtonClick = async () => {
    if (!groupId || localStorage.getItem('id') === null) {
      setErrorMessage('기도모임 아이디를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 초대 코드로 그룹 참여
      const response = await joinGroupByInviteCode(groupId);
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
        '기도모임 아이디가 존재하지 않거나 참여할 수 없습니다. 다시 확인해주세요.'
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
        // 로컬스토리지 업데이트 (생성자는 리더가 됨)
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
      setGroupId(text);
      setErrorMessage('');
    } catch (error) {
      console.error('클립보드 읽기 실패:', error);
      setErrorMessage('클립보드 읽기에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Praygram
        </h1>

        {/* 탭 메뉴 */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
              setGroupId('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'join'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            기도모임 참여
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
              setGroupName('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            기도모임 생성
          </button>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* 기도모임 참여 탭 */}
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="groupId"
              >
                공유받은 기도모임 초대 코드를 입력해주세요
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  id="groupId"
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="초대 코드를 입력하세요"
                  disabled={isLoading}
                />
                <button
                  onClick={handlePasteClick}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  붙여넣기
                </button>
              </div>
            </div>

            <button
              onClick={handleJoinButtonClick}
              disabled={isLoading || !groupId.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '참여 중...' : '기도모임 참여하기'}
            </button>
          </div>
        )}

        {/* 기도모임 생성 탭 */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="groupName"
              >
                새로운 기도모임 이름을 입력해주세요
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                id="groupName"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="예: 우리 교회 기도모임"
                maxLength={100}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                생성하시면 자동으로 모임의 관리자가 됩니다.
              </p>
            </div>

            <button
              onClick={handleCreateButtonClick}
              disabled={isLoading || !groupName.trim()}
              className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '생성 중...' : '기도모임 생성하기'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            기도모임에 참여하여 함께 기도해보세요
          </p>
        </div>
      </div>
    </div>
  );
}
