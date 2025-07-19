'use client';
import { usePathname } from 'next/navigation';
import Navbar from '../navbar';
import { useState } from 'react';
import { createPrayer } from '@/apis/prayers';
import { CreatePrayerRequest } from '@/types/prayer';

export default function Add() {
  const pathname = usePathname();
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const groupId = pathname.split('/')[1];
      const prayerData: CreatePrayerRequest = {
        title: title.trim(),
        content: content.trim(),
        group_id: groupId,
      };

      await createPrayer(prayerData);

      // 성공 후 그룹 페이지로 이동
      setTimeout(() => {
        window.location.href = `/${groupId}`;
      }, 1000);
    } catch (error) {
      console.error('기도제목 생성 실패:', error);
      alert('기도제목 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle="기도제목 추가" />
      </header>
      <main className="flex w-full h-full py-28 align-top justify-center">
        <form className="flex flex-col w-full max-w-xl space-y-4">
          <div>
            <label
              className="block text-gray-500 font-bold mb-2"
              htmlFor="title"
            >
              제목
            </label>
            <input
              className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="기도제목을 입력하세요 (최대 100자)"
            />
            <div className="text-xs text-gray-400 mt-1">{title.length}/100</div>
          </div>

          <div>
            <label
              className="block text-gray-500 font-bold mb-2"
              htmlFor="content"
            >
              내용
            </label>
            <textarea
              className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="content"
              rows={8}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="기도 내용을 자세히 입력하세요 (최대 500자)"
            />
            <div className="text-xs text-gray-400 mt-1">
              {content.length}/500
            </div>
          </div>

          <div className="w-full">
            <button
              className="shadow w-full bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? '저장 중...' : '기도제목 공유하기'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
