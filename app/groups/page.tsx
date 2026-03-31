'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserGroups, createGroup, joinGroupSmart } from '@/apis/groups';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

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

type ActiveForm = 'none' | 'create' | 'join';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');
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

  const closeForm = () => {
    setActiveForm('none');
    setNewGroupName('');
    setInviteCode('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="glass-card w-full max-w-sm px-8 py-10 flex flex-col gap-6 fade-in rounded-3xl">
        <h1 className="text-2xl font-light tracking-tight text-gray-900 text-center">
          기도모임
        </h1>

        {error && (
          <p className="text-sm text-center text-red-500">{error}</p>
        )}

        {/* Groups List */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-2">
            {groups.map((group) => {
              const userRole = group.group_members[0]?.role;
              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupClick(group.id, userRole)}
                  className="glass-button w-full px-4 py-3.5 rounded-xl text-left flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {group.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-3 shrink-0">
                    {userRole === 'LEADER' ? '관리자' : '멤버'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {groups.length === 0 && activeForm === 'none' && (
          <p className="text-sm text-center text-gray-400">
            참여한 기도모임이 없습니다
          </p>
        )}

        {/* Divider */}
        {groups.length > 0 && (
          <div className="border-t border-gray-100/60" />
        )}

        {/* Create Form */}
        {activeForm === 'create' && (
          <div className="flex flex-col gap-3 slide-up">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => { setNewGroupName(e.target.value); setError(''); }}
              placeholder="기도모임 이름"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              maxLength={100}
              disabled={isActionLoading}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                disabled={isActionLoading}
                className="glass-button flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isActionLoading || !newGroupName.trim()}
                className="primary-button flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isActionLoading && <LoadingSpinner />}
                {isActionLoading ? '생성 중...' : '만들기'}
              </button>
            </div>
          </div>
        )}

        {/* Join Form */}
        {activeForm === 'join' && (
          <div className="flex flex-col gap-3 slide-up">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value); setError(''); }}
              placeholder="초대 링크 또는 아이디"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              disabled={isActionLoading}
              autoFocus
            />
            <button
              onClick={handlePasteClick}
              disabled={isActionLoading}
              className="glass-button w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-50"
            >
              클립보드에서 붙여넣기
            </button>
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                disabled={isActionLoading}
                className="glass-button flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleJoinGroup}
                disabled={isActionLoading || !inviteCode.trim()}
                className="primary-button flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isActionLoading && <LoadingSpinner />}
                {isActionLoading ? '참여 중...' : '참여하기'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {activeForm === 'none' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setActiveForm('join')}
              className="glass-button w-full py-3 rounded-xl text-sm font-medium text-gray-700"
            >
              초대 링크로 참여하기
            </button>
            <button
              onClick={() => setActiveForm('create')}
              className="primary-button w-full py-3 rounded-xl text-sm font-medium text-white"
            >
              새 기도모임 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
