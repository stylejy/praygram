'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';

export default function PreviewAddPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('미리보기 페이지 - 실제 저장되지 않습니다.');
  };

  return (
    <div className="min-h-screen">
      <nav className="quiet-header fixed inset-x-0 top-0 z-50">
        <div className="relative mx-auto flex h-[72px] w-full max-w-xl items-center px-4 md:px-0">
          <Link
            href="/preview"
            className="quiet-icon-button absolute left-[4.5px] top-1/2 shrink-0 -translate-y-1/2 md:-left-[14px]"
            aria-label="기도목록으로 이동"
          >
            <FaChevronLeft size={13} />
          </Link>
          <div className="ml-12 min-w-0 flex-1">
            <p className="section-eyebrow">기도제목</p>
            <h1 className="truncate text-[17px] font-semibold leading-6 text-[color:var(--text-primary)]">
              새 기도제목 등록
            </h1>
          </div>
        </div>
      </nav>

      <main className="px-4 pb-10 pt-24">
        <form
          onSubmit={handleSubmit}
          className="content-panel max-w-xl space-y-5 fade-in"
        >
          <div>
            <p className="section-eyebrow">기도 요청</p>
            <h2 className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">
              함께 나눌 기도제목을 적어주세요
            </h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              이름
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              기도제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목을 입력하세요"
              className="glass-input w-full rounded-lg px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              maxLength={100}
            />
            <span className="text-right text-xs text-[color:var(--text-muted)]">
              {title.length}/100
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              상세 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="구체적인 기도 요청사항을 작성해주세요"
              className="glass-input w-full resize-none rounded-lg px-4 py-3 text-sm leading-6 text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]"
              rows={5}
              maxLength={500}
            />
            <span className="text-right text-xs text-[color:var(--text-muted)]">
              {content.length}/500
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/preview"
              className="glass-button flex-1 rounded-lg py-3 text-center text-sm font-medium text-[color:var(--text-secondary)]"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || !authorName.trim()}
              className="primary-button flex-1 rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              등록하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
