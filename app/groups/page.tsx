'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserGroups, createGroup, joinGroupSmart } from '@/apis/groups';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { FaLink, FaPlus } from 'react-icons/fa';
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
    <main className="page-shell flex items-center justify-center">
      <section className="content-panel max-w-md fade-in">
        <div className="mb-6 flex items-start gap-3">
          <PraygramLogo size="md" className="mt-0.5" />
          <div className="min-w-0">
            <p className="section-eyebrow">Praygram</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">
              함께 기도할 모임을 선택하세요
            </h1>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
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
                  className="glass-button w-full rounded-lg px-4 py-4 text-left"
                >
                  <span className="flex min-w-0 items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
                      {group.name}
                    </span>
                    <span className="shrink-0 rounded-full border border-[color:var(--accent-border)] bg-white/60 px-2.5 py-1 text-[11px] font-medium text-[color:var(--text-muted)]">
                      {userRole === 'LEADER' ? '관리자' : '멤버'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {groups.length === 0 && activeForm === 'none' && (
          <p className="rounded-lg border border-[color:var(--accent-border)] bg-white/50 px-4 py-6 text-center text-sm text-[color:var(--text-muted)]">
            참여한 기도모임이 없습니다
          </p>
        )}

        {/* Divider */}
        {groups.length > 0 && (
          <div className="quiet-divider my-5" />
        )}

        {/* Create Form */}
        {activeForm === 'create' && (
          <div className="flex flex-col gap-3 slide-up">
            <label className="field-label">새 기도모임</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => {
                setNewGroupName(e.target.value);
                setError('');
              }}
              placeholder="기도모임 이름"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={100}
              disabled={isActionLoading}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                disabled={isActionLoading}
                className="glass-button flex-1 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)] disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isActionLoading || !newGroupName.trim()}
                className="primary-button flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
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
            <label className="field-label">초대 링크</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setError('');
              }}
              placeholder="초대 링크 또는 아이디"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              disabled={isActionLoading}
              autoFocus
            />
            <button
              onClick={handlePasteClick}
              disabled={isActionLoading}
              className="glass-button w-full rounded-lg py-2.5 text-sm font-medium text-[color:var(--text-secondary)] disabled:opacity-50"
            >
              클립보드에서 붙여넣기
            </button>
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                disabled={isActionLoading}
                className="glass-button flex-1 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)] disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleJoinGroup}
                disabled={isActionLoading || !inviteCode.trim()}
                className="primary-button flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {isActionLoading && <LoadingSpinner />}
                {isActionLoading ? '참여 중...' : '참여하기'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {activeForm === 'none' && (
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={() => setActiveForm('join')}
              className="glass-button flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)]"
            >
              <FaLink size={13} />
              초대 링크로 참여하기
            </button>
            <button
              onClick={() => setActiveForm('create')}
              className="primary-button flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white"
            >
              <FaPlus size={13} />
              새 기도모임 만들기
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
