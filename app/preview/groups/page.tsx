'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="glass-card w-full max-w-sm px-8 py-10 flex flex-col gap-6 fade-in rounded-3xl">
        <h1 className="text-2xl font-light tracking-tight text-gray-900 text-center">
          기도모임
        </h1>

        {error && (
          <p className="text-sm text-center text-red-500">{error}</p>
        )}

        {/* Groups List */}
        <div className="flex flex-col gap-2">
          {mockGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => router.push(`/preview`)}
              className="glass-button w-full px-4 py-3.5 rounded-xl text-left flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-800 truncate">
                {group.name}
              </span>
              <span className="text-xs text-gray-400 ml-3 shrink-0">
                {group.role === 'LEADER' ? '관리자' : '멤버'}
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100/60" />

        {/* Create Form */}
        {activeForm === 'create' && (
          <div className="flex flex-col gap-3 slide-up">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="기도모임 이름"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              maxLength={100}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="glass-button flex-1 py-3 rounded-xl text-sm font-medium text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => alert('미리보기 — 실제 저장되지 않습니다.')}
                disabled={!newGroupName.trim()}
                className="primary-button flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              >
                만들기
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
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 링크 또는 아이디"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              autoFocus
            />
            <button className="glass-button w-full py-2.5 rounded-xl text-sm font-medium text-gray-600">
              클립보드에서 붙여넣기
            </button>
            <div className="flex gap-3">
              <button
                onClick={closeForm}
                className="glass-button flex-1 py-3 rounded-xl text-sm font-medium text-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => alert('미리보기 — 실제 저장되지 않습니다.')}
                disabled={!inviteCode.trim()}
                className="primary-button flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
              >
                참여하기
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
