'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserGroups, createGroup, joinGroupSmart } from '@/apis/groups';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { PraygramLogo } from '@/app/components/PraygramLogo';

interface Group {
  id: string;
  name: string;
  description?: string;
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
      setError('초대 링크를 입력해주세요.');
      return;
    }

    setIsActionLoading(true);
    setError('');

    try {
      const response = await joinGroupSmart(inviteCode.trim());
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
      setError('그룹 참여에 실패했습니다. 초대 링크를 확인해주세요.');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 rounded-3xl text-center slide-up">
          <PraygramLogo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            그룹 목록을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <PraygramLogo size="xl" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            기도모임 선택
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            참여하고 싶은 기도모임을 선택하거나 새로 만들어보세요
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card border-red-200 bg-red-50/90 p-4 rounded-2xl mb-8 max-w-2xl mx-auto slide-up">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* My Groups */}
        {groups.length > 0 && (
          <div className="mb-16 fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              내 기도모임
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group, index) => {
                const userRole = group.group_members[0]?.role;
                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupClick(group.id, userRole)}
                    className="glass-card p-6 rounded-2xl cursor-pointer group slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(group.created_at).toLocaleDateString(
                            'ko-KR'
                          )}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          userRole === 'LEADER'
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {userRole === 'LEADER' ? '관리자' : '멤버'}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Create Group */}
          <div className="glass-card p-8 rounded-3xl slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-white/50">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                새 기도모임 만들기
              </h3>
              <p className="text-gray-600">나만의 기도모임을 시작해보세요</p>
            </div>

            {showCreateForm ? (
              <div className="space-y-4 slide-up">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="기도모임 이름을 입력하세요"
                  className="glass-input w-full px-4 py-3 rounded-xl font-medium"
                  maxLength={100}
                  disabled={isActionLoading}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewGroupName('');
                      setError('');
                    }}
                    disabled={isActionLoading}
                    className="glass-button flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={isActionLoading || !newGroupName.trim()}
                    className="success-button flex-1 py-3 px-4 rounded-xl font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <LoadingSpinner />}
                    {isActionLoading ? '생성 중...' : '생성하기'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="success-button w-full py-4 px-6 rounded-xl font-semibold text-white"
              >
                새 기도모임 만들기
              </button>
            )}
          </div>

          {/* Join Group */}
          <div className="glass-card p-8 rounded-3xl slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-white/50">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                기도모임 참여하기
              </h3>
              <p className="text-gray-600">초대받은 기도모임에 참여하세요</p>
            </div>

            {showJoinForm ? (
              <div className="space-y-4 slide-up">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="초대 링크를 입력하세요"
                    className="glass-input flex-1 px-4 py-3 rounded-xl font-medium"
                    disabled={isActionLoading}
                  />
                  <button
                    onClick={handlePasteClick}
                    disabled={isActionLoading}
                    className="glass-button px-4 py-3 rounded-xl text-sm font-medium text-gray-700 disabled:opacity-50"
                  >
                    📋
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setInviteCode('');
                      setError('');
                    }}
                    disabled={isActionLoading}
                    className="glass-button flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleJoinGroup}
                    disabled={isActionLoading || !inviteCode.trim()}
                    className="primary-button flex-1 py-3 px-4 rounded-xl font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isActionLoading && <LoadingSpinner />}
                    {isActionLoading ? '참여 중...' : '참여하기'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowJoinForm(true)}
                className="primary-button w-full py-4 px-6 rounded-xl font-semibold text-white"
              >
                기도모임 참여하기
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <div className="text-center py-16 fade-in">
            <PraygramLogo size="xl" className="mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              아직 참여한 기도모임이 없습니다
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              새로운 기도모임을 만들거나 기존 모임에 참여해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
