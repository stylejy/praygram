'use client';
import Navbar from '../../[groupId]/navbar';
import { useState } from 'react';

export default function PreviewAdd() {
  const [prayers, setPrayers] = useState<string>('');

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle="기도 작성" />
      </header>
      <main className="flex w-full justify-center pt-24 pb-8">
        <div className="animate-fade-in glass-card w-full max-w-xl p-8 flex flex-col gap-5">
          <label
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
            htmlFor="prayer-input"
          >
            기도 제목을 작성해 주세요
          </label>
          <textarea
            className="glass-input"
            id="prayer-input"
            rows={8}
            value={prayers}
            onChange={(e) => setPrayers(e.target.value)}
            placeholder="이곳에 기도 제목을 적어주세요..."
            style={{ resize: 'none' }}
          />
          <button
            className="btn-primary mt-1"
            type="button"
            onClick={() => alert('기도가 공유되었습니다! (preview)')}
          >
            기도 공유하기
          </button>
        </div>
      </main>
    </div>
  );
}
