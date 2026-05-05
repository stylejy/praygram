'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaPlus, FaRegHeart, FaShareAlt } from 'react-icons/fa';
import { PraygramLogo } from '@/app/components/PraygramLogo';

const mockPrayers = [
  {
    id: '1',
    title: '취업 준비 중인 친구를 위해 기도해주세요',
    content:
      '저의 친한 친구가 졸업 후 6개월째 취업을 준비하고 있습니다. 매일 지원서를 내고 있지만 계속 떨어지고 있어 많이 지쳐있습니다. 하나님의 좋은 인도하심이 있기를 기도해주세요.',
    author_name: '김민준',
    time_label: '30분 전',
    reaction_count: 12,
  },
  {
    id: '2',
    title: '어머니 수술 후 회복을 위한 기도 부탁드립니다',
    content:
      '저희 어머니께서 지난주에 무릎 수술을 받으셨습니다. 수술은 잘 됐다고 하는데 회복이 더딘 편입니다. 빠른 회복과 합병증 없이 건강하게 낫기를 기도해주세요.',
    author_name: '이서연',
    time_label: '2시간 전',
    reaction_count: 24,
  },
  {
    id: '3',
    title: '이번 주 있는 발표를 잘 마칠 수 있도록',
    content:
      '금요일에 팀 프로젝트 최종 발표가 있습니다. 몇 달간 열심히 준비했는데 긴장이 많이 됩니다. 평안한 마음으로 발표할 수 있도록, 그리고 좋은 결과가 있도록 기도 부탁드립니다.',
    author_name: '박지훈',
    time_label: '5시간 전',
    reaction_count: 8,
  },
  {
    id: '4',
    title: '새로운 직장에서 잘 적응할 수 있도록 기도해주세요',
    content:
      '다음 주부터 새 직장을 시작합니다. 새로운 환경, 새로운 동료들과 잘 어울리고 맡은 일을 잘 감당할 수 있도록 기도 부탁드립니다. 하나님이 주신 이 기회에 감사하며 최선을 다하고 싶습니다.',
    author_name: '최유진',
    time_label: '1일 전',
    reaction_count: 17,
  },
  {
    id: '5',
    title: '가족 간의 화해와 회복을 위해',
    content:
      '오랫동안 가족 관계가 어려웠습니다. 특히 아버지와의 관계가 많이 멀어졌는데, 서로 이해하고 용서하며 회복될 수 있도록 기도해주세요. 하나님의 사랑이 가정 가운데 임하기를 원합니다.',
    author_name: '강동현',
    time_label: '2일 전',
    reaction_count: 31,
  },
];

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
    <div className="glass-card rounded-lg p-6 slide-up">
      {/* Author */}
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--accent-border)] bg-[color:var(--primary-soft)]">
          <span className="text-xs font-semibold text-[color:var(--primary)]">
            {prayer.author_name.charAt(0)}
          </span>
        </div>
        <span className="text-sm font-medium text-[color:var(--text-secondary)]">
          {prayer.author_name}
        </span>
        <span className="ml-auto text-xs text-[color:var(--text-muted)]">
          {prayer.time_label}
        </span>
      </div>

      {/* Content */}
      <div className="mb-5">
        <h3 className="mb-3 text-[17px] font-semibold leading-snug text-[color:var(--text-primary)]">
          {prayer.title}
        </h3>
        <p className="text-[15px] leading-7 text-[color:var(--text-secondary)]">
          {prayer.content}
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-[rgba(117,98,214,0.11)] pt-4">
        <button
          onClick={handleReaction}
          className="primary-button gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200"
        >
          <FaRegHeart size={13} />
          {hasEverPrayed ? '계속 기도' : '함께 기도'}
        </button>
        <span className="text-xs text-[color:var(--text-muted)]">
          {reactionCount}명이 함께 기도
        </span>
      </div>

      {showPrayEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-20">
          <PraygramLogo size="xl" className="animate-pray-effect" />
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
    <div className="min-h-screen pb-28 md:pb-8">
      {/* Navbar */}
      <nav className="quiet-header fixed inset-x-0 top-0 z-50">
        <div className="relative mx-auto flex h-[72px] w-full max-w-2xl items-center px-4 md:px-0">
          <Link
            href="/groups"
            className="quiet-icon-button absolute left-[4.5px] top-1/2 shrink-0 -translate-y-1/2 md:-left-[14px]"
            aria-label="그룹 목록으로 이동"
          >
            <FaChevronLeft size={13} />
          </Link>
          <div className="ml-12 flex min-w-0 flex-1 items-center gap-2.5">
            <PraygramLogo size="sm" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-4 text-[color:var(--primary)]">
                기도모임
              </p>
              <h1 className="truncate text-[17px] font-semibold leading-6 text-[color:var(--text-primary)]">
                청년부 기도모임
              </h1>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full border border-[color:var(--accent-border)] bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[color:var(--text-muted)] sm:inline-flex">
            미리보기
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-36 md:pb-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">
                기도제목
              </p>
              <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                {mockPrayers.length}개의 마음이 올라왔어요
              </p>
            </div>
            <span className="text-xs text-[color:var(--text-muted)]">
              최근 순
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {mockPrayers.map((prayer, index) => (
              <div key={prayer.id} className="slide-up" style={{ animationDelay: `${index * 0.06}s` }}>
                <MockPraycard prayer={prayer} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Desktop FAB */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col space-y-3 z-50">
        <div className="relative">
          <button
            onClick={handleInvite}
            className="glass-button flex h-12 w-12 items-center justify-center rounded-full text-[color:var(--text-secondary)]"
            title="초대하기"
          >
            <FaShareAlt size={15} />
          </button>
          {showCopySuccess && (
            <div className="absolute bottom-full mb-2 right-0 rounded-lg bg-[color:var(--text-primary)] px-3 py-1.5 text-xs text-white whitespace-nowrap slide-up">
              초대 링크 복사됨!
            </div>
          )}
        </div>
        <Link
          href="/preview/add"
          className="primary-button flex h-12 w-12 items-center justify-center rounded-full text-white"
          title="기도제목 등록"
        >
          <FaPlus size={16} />
        </Link>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-[rgba(247,243,237,0.96)] via-[rgba(247,243,237,0.82)] to-transparent px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 md:hidden">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-lg border border-[color:var(--accent-border)] bg-[rgba(255,253,248,0.92)] p-1.5 shadow-[0_10px_28px_rgba(74,57,128,0.12)] backdrop-blur-md">
          <div className="relative min-w-0 flex-[0.9]">
            <button
              onClick={handleInvite}
              className="flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-[color:var(--accent-border)] bg-white/75 px-2 text-[13px] font-semibold text-[color:var(--text-secondary)] shadow-sm transition active:scale-[0.99]"
            >
              <FaShareAlt size={13} className="shrink-0" />
              <span className="truncate">초대하기</span>
            </button>
            {showCopySuccess && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-lg bg-[color:var(--text-primary)] px-3 py-1.5 text-xs text-white whitespace-nowrap slide-up">
                초대 링크 복사됨!
              </div>
            )}
          </div>
          <Link
            href="/preview/add"
            className="primary-button flex h-10 min-w-0 flex-[1.1] items-center justify-center gap-1.5 rounded-md px-2 text-center text-[13px] font-semibold text-white transition active:scale-[0.99]"
          >
            <FaPlus size={13} className="shrink-0" />
            <span className="truncate">기도제목 등록</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
