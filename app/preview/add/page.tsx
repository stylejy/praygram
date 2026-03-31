'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PreviewAddPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('미리보기 페이지 - 실제 저장되지 않습니다.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="glass-card w-full max-w-sm px-8 py-10 flex flex-col gap-6 fade-in rounded-3xl">
        <h1 className="text-2xl font-light tracking-tight text-gray-900 text-center">
          기도제목 등록
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              이름
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              기도제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목을 입력하세요"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm"
              maxLength={100}
            />
            <span className="text-xs text-gray-400 text-right">{title.length}/100</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              상세 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="구체적인 기도 요청사항을 작성해주세요"
              className="glass-input w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm resize-none"
              rows={5}
              maxLength={500}
            />
            <span className="text-xs text-gray-400 text-right">{content.length}/500</span>
          </div>

          <div className="flex gap-3 mt-2">
            <Link
              href="/preview"
              className="glass-button flex-1 py-3 rounded-xl text-sm font-medium text-gray-600 text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || !authorName.trim()}
              className="primary-button flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
