'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaShare } from 'react-icons/fa';

const mockPrayers = [
  {
    id: '1',
    title: '취업 준비 중인 친구를 위해 기도해주세요',
    content:
      '저의 친한 친구가 졸업 후 6개월째 취업을 준비하고 있습니다. 매일 지원서를 내고 있지만 계속 떨어지고 있어 많이 지쳐있습니다. 하나님의 좋은 인도하심이 있기를 기도해주세요.',
    author_name: '김민준',
    author_id: 'user-1',
    group_id: 'preview-group',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reaction_count: 12,
    reactions: [],
  },
  {
    id: '2',
    title: '어머니 수술 후 회복을 위한 기도 부탁드립니다',
    content:
      '저희 어머니께서 지난주에 무릎 수술을 받으셨습니다. 수술은 잘 됐다고 하는데 회복이 더딘 편입니다. 빠른 회복과 합병증 없이 건강하게 낫기를 기도해주세요.',
    author_name: '이서연',
    author_id: 'user-2',
    group_id: 'preview-group',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    reaction_count: 24,
    reactions: [],
  },
  {
    id: '3',
    title: '이번 주 있는 발표를 잘 마칠 수 있도록',
    content:
      '금요일에 팀 프로젝트 최종 발표가 있습니다. 몇 달간 열심히 준비했는데 긴장이 많이 됩니다. 평안한 마음으로 발표할 수 있도록, 그리고 좋은 결과가 있도록 기도 부탁드립니다.',
    author_name: '박지훈',
    author_id: 'user-3',
    group_id: 'preview-group',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reaction_count: 8,
    reactions: [],
  },
  {
    id: '4',
    title: '새로운 직장에서 잘 적응할 수 있도록 기도해주세요',
    content:
      '다음 주부터 새 직장을 시작합니다. 새로운 환경, 새로운 동료들과 잘 어울리고 맡은 일을 잘 감당할 수 있도록 기도 부탁드립니다. 하나님이 주신 이 기회에 감사하며 최선을 다하고 싶습니다.',
    author_name: '최유진',
    author_id: 'user-4',
    group_id: 'preview-group',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reaction_count: 17,
    reactions: [],
  },
  {
    id: '5',
    title: '가족 간의 화해와 회복을 위해',
    content:
      '오랫동안 가족 관계가 어려웠습니다. 특히 아버지와의 관계가 많이 멀어졌는데, 서로 이해하고 용서하며 회복될 수 있도록 기도해주세요. 하나님의 사랑이 가정 가운데 임하기를 원합니다.',
    author_name: '강동현',
    author_id: 'user-5',
    group_id: 'preview-group',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reaction_count: 31,
    reactions: [],
  },
];

function getFormattedTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}분 전`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

function MockPraycard({ prayer }: { prayer: (typeof mockPrayers)[0] }) {
  const [reactionCount, setReactionCount] = useState(prayer.reaction_count);
  const [hasEverPrayed, setHasEverPrayed] = useState(false);
  const [showPrayEffect, setShowPrayEffect] = useState(false);

  const handleReaction = () => {
    setShowPrayEffect(true);
    setTimeout(() => setShowPrayEffect(false), 2000);
    setReactionCount((p) => p + 1);
    setHasEverPrayed(true);
  };

  return (
    <div className="glass-card p-6 rounded-2xl mb-6 slide-up">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm border border-white/60">
          <span className="text-gray-600 font-semibold text-sm">
            {prayer.author_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-semibold text-gray-900">{prayer.author_name}</span>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {prayer.title}
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {prayer.content}
        </p>
      </div>

      <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between">
        <button
          onClick={handleReaction}
          className="glass-button flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200"
        >
          <span className="text-lg">🙏</span>
          <span className="text-gray-700">{hasEverPrayed ? '또 기도합니다' : '기도하기'}</span>
        </button>
        <div className="flex items-center text-gray-600">
          <span className="font-semibold text-sm">{reactionCount}번 기도 받았습니다</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-500 font-medium">
          {getFormattedTime(prayer.created_at)}
        </span>
      </div>

      {showPrayEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-20">
          <div className="animate-pray-effect">
            <span className="text-6xl">🙏</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreviewPage() {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleInvite = () => {
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Navbar */}
      <nav
        className="glass-navbar fixed inset-x-0 z-50 mx-4 flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{ top: '0.75rem' }}
      >
        <span className="font-semibold text-gray-900 text-base tracking-tight">
          청년부 기도모임
        </span>
        <span className="text-xs text-gray-500 bg-gray-100/60 px-2.5 py-1 rounded-full font-medium">
          미리보기
        </span>
      </nav>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6 fade-in">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">
                총 {mockPrayers.length}개의 기도제목이 있습니다
              </p>
            </div>
            {mockPrayers.map((prayer, index) => (
              <div key={prayer.id} className="slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
                <MockPraycard prayer={prayer} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Desktop FAB */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col space-y-4 z-50">
        <div className="relative group">
          <button
            onClick={handleInvite}
            className="glass-button w-14 h-14 rounded-full flex items-center justify-center"
            title="초대하기"
          >
            <FaShare size={16} className="text-gray-600" />
          </button>
          {showCopySuccess && (
            <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap slide-up">
              초대 링크 복사됨!
            </div>
          )}
        </div>
        <Link
          href="/preview/add"
          className="primary-button w-14 h-14 rounded-full flex items-center justify-center"
          title="기도제목 등록"
        >
          <FaPlus size={18} className="text-white" />
        </Link>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="glass-navbar rounded-2xl p-3 flex space-x-3">
          <div className="relative flex-1">
            <button
              onClick={handleInvite}
              className="glass-button w-full py-3 rounded-xl font-medium text-gray-700 flex items-center justify-center space-x-2"
            >
              <FaShare size={14} />
              <span>초대하기</span>
            </button>
            {showCopySuccess && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap slide-up">
                초대 링크 복사됨!
              </div>
            )}
          </div>
          <Link
            href="/preview/add"
            className="primary-button flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center space-x-2"
          >
            <FaPlus size={14} />
            <span>기도제목 등록</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
