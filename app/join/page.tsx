'use client';
import { joinGroup } from '@/apis/members';
import { createGroup, joinGroupByInviteCode } from '@/apis/groups';
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
      setGroupId(text);
      setErrorMessage('');
    } catch (error) {
      console.error('클립보드 읽기 실패:', error);
      setErrorMessage('클립보드 읽기에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-white/50">
            <PraygramLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            기도모임 참여
          </h1>
          <p className="text-gray-600">
            새로운 기도모임에 참여하거나 직접 만들어보세요
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card p-2 rounded-2xl mb-6 slide-up">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('join');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'join'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              모임 참여
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              모임 만들기
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/50 slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="glass-card p-8 rounded-3xl slide-up">
          {activeTab === 'join' ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border border-white/50">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  기도모임 참여
                </h2>
                <p className="text-gray-600 text-sm">
                  초대 코드를 입력하여 기도모임에 참여하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  초대 코드 *
                </label>
                <input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="초대 코드를 입력하세요"
                  className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 font-medium placeholder-gray-500"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  기도모임 리더에게 초대 코드를 받아 입력해주세요
                </p>
              </div>

              <button
                onClick={handleJoinButtonClick}
                disabled={isLoading || !groupId.trim()}
                className="primary-button w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-105"
              >
                {isLoading && <LoadingSpinner />}
                <span>{isLoading ? '참여 중...' : '모임 참여하기'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border border-white/50">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  새 기도모임 만들기
                </h2>
                <p className="text-gray-600 text-sm">
                  새로운 기도모임을 만들고 다른 분들을 초대하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  모임 이름 *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="기도모임 이름을 입력하세요"
                  className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 font-medium placeholder-gray-500"
                  maxLength={50}
                  disabled={isLoading}
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    의미있는 모임 이름을 지어주세요
                  </p>
                  <span className="text-xs text-gray-400">
                    {groupName.length}/50
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateButtonClick}
                disabled={isLoading || !groupName.trim()}
                className="success-button w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-105"
              >
                {isLoading && <LoadingSpinner />}
                <span>{isLoading ? '생성 중...' : '모임 만들기'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 rounded-2xl bg-blue-50/80 border border-blue-200/50 fade-in">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="text-lg mr-2">💡</span>
            {activeTab === 'join' ? '참여 안내' : '모임 운영 팁'}
          </h3>
          {activeTab === 'join' ? (
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                초대 코드는 기도모임 리더가 제공합니다
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                참여 후 기도제목을 자유롭게 나누어보세요
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                다른 분들의 기도제목에도 응답해주세요
              </li>
            </ul>
          ) : (
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                모임 이름은 나중에 변경할 수 있습니다
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                생성 후 초대 코드를 통해 멤버를 초대하세요
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                정기적인 기도제목 나눔을 격려해주세요
              </li>
            </ul>
          )}
        </div>

        {/* Back to Groups */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/groups')}
            className="text-gray-500 hover:text-gray-700 font-medium underline"
          >
            그룹 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
