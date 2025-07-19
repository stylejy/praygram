'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUserGroups,
  createGroup,
  joinGroupByInviteCode,
} from '@/apis/groups';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

interface Group {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_at: string;
  group_members: Array<{
    user_id: string;
    role: 'LEADER' | 'MEMBER';
  }>;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await getUserGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error('그룹 목록 조회 실패:', error);
      setError('그룹 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupClick = (groupId: string, role: string) => {
    // 로컬스토리지 업데이트
    localStorage.setItem('group', groupId);
    localStorage.setItem('isManager', role === 'LEADER' ? 'true' : 'false');
    router.push(`/${groupId}`);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('그룹 이름을 입력해주세요.');
      return;
    }

    setIsActionLoading(true);
    setError('');

    try {
      const response = await createGroup(newGroupName.trim());
      if (response) {
        localStorage.setItem('group', response.id);
        localStorage.setItem('isManager', 'true');
        router.push(`/${response.id}`);
      }
    } catch (error) {
      console.error('그룹 생성 실패:', error);
      setError('그룹 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }

    setIsActionLoading(true);
    setError('');

    try {
      const response = await joinGroupByInviteCode(inviteCode.trim());
      if (response) {
        localStorage.setItem('group', response.groupId);
        localStorage.setItem(
          'isManager',
          response.role === 'LEADER' ? 'true' : 'false'
        );
        router.push(`/${response.groupId}`);
      }
    } catch (error) {
      console.error('그룹 참여 실패:', error);
      setError('그룹 참여에 실패했습니다. 초대 코드를 확인해주세요.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteCode(text);
      setError('');
    } catch (error) {
      console.error('클립보드 읽기 실패:', error);
      setError('클립보드 읽기에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">그룹 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            기도모임 선택
          </h1>
          <p className="text-gray-600">
            참여하고 싶은 기도모임을 선택하거나 새로 만들어보세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* 내 그룹 목록 */}
        {groups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              내 기도모임
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const userRole = group.group_members[0]?.role;
                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupClick(group.id, userRole)}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {group.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          userRole === 'LEADER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {userRole === 'LEADER' ? '관리자' : '멤버'}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      생성일:{' '}
                      {new Date(group.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 새 그룹 생성 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              새 기도모임 만들기
            </h3>
            {showCreateForm ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="기도모임 이름을 입력하세요"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  maxLength={100}
                  disabled={isActionLoading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewGroupName('');
                      setError('');
                    }}
                    disabled={isActionLoading}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={isActionLoading || !newGroupName.trim()}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <LoadingSpinner />}
                    {isActionLoading ? '생성 중...' : '생성하기'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                새 기도모임 만들기
              </button>
            )}
          </div>

          {/* 기존 그룹 참여 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              기도모임 참여하기
            </h3>
            {showJoinForm ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="초대 코드를 입력하세요"
                    className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isActionLoading}
                  />
                  <button
                    onClick={handlePasteClick}
                    disabled={isActionLoading}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    붙여넣기
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setInviteCode('');
                      setError('');
                    }}
                    disabled={isActionLoading}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleJoinGroup}
                    disabled={isActionLoading || !inviteCode.trim()}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <LoadingSpinner />}
                    {isActionLoading ? '참여 중...' : '참여하기'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                기도모임 참여하기
              </button>
            )}
          </div>
        </div>

        {/* 빈 상태 메시지 */}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 참여한 기도모임이 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              새로운 기도모임을 만들거나 기존 모임에 참여해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
