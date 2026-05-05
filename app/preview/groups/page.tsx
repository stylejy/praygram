'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLink, FaPlus } from 'react-icons/fa';

const mockGroups = [
  { id: '1', name: '청년부 기도모임', role: 'LEADER', created_at: '2024-01-15' },
  { id: '2', name: '새벽기도 모임', role: 'MEMBER', created_at: '2024-03-02' },
  { id: '3', name: '가족 기도방', role: 'MEMBER', created_at: '2024-06-10' },
];

type ActiveForm = 'none' | 'create' | 'join';

export default function PreviewGroupsPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<ActiveForm>('none');
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const closeForm = () => {
    setActiveForm('none');
    setNewGroupName('');
    setInviteCode('');
    setError('');
  };

  return (
    <main className="page-shell flex items-center justify-center">
      <section className="content-panel max-w-md fade-in">
        <div className="mb-6">
          <p className="section-eyebrow">기도모임</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">
            함께 기도할 모임을 선택하세요
          </h1>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Groups List */}
        <div className="flex flex-col gap-2">
          {mockGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => router.push(`/preview`)}
              className="glass-button w-full rounded-lg px-4 py-4 text-left"
            >
              <span className="flex min-w-0 items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
                  {group.name}
                </span>
                <span className="shrink-0 rounded-full border border-[color:var(--accent-border)] bg-white/60 px-2.5 py-1 text-[11px] font-medium text-[color:var(--text-muted)]">
                  {group.role === 'LEADER' ? '관리자' : '멤버'}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="quiet-divider my-5" />

        {/* Create Form */}
        {activeForm === 'create' && (
          <div className="flex flex-col gap-3 slide-up">
            <label className="field-label">새 기도모임</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="기도모임 이름"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={100}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="glass-button flex-1 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)]"
              >
                취소
              </button>
              <button
                onClick={() => alert('미리보기 — 실제 저장되지 않습니다.')}
                disabled={!newGroupName.trim()}
                className="primary-button flex-1 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                만들기
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
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 링크 또는 아이디"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              autoFocus
            />
            <button className="glass-button w-full rounded-lg py-2.5 text-sm font-medium text-[color:var(--text-secondary)]">
              클립보드에서 붙여넣기
            </button>
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="glass-button flex-1 rounded-lg py-3 text-sm font-medium text-[color:var(--text-secondary)]"
              >
                취소
              </button>
              <button
                onClick={() => alert('미리보기 — 실제 저장되지 않습니다.')}
                disabled={!inviteCode.trim()}
                className="primary-button flex-1 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                참여하기
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
