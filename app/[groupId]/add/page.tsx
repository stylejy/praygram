'use client';
import { usePathname } from 'next/navigation';
import Navbar from '../navbar';
import { useState } from 'react';
import { createPrayers } from '@/apis/prayers';

export default function Add() {
  const pathname = usePathname();
  const [prayers, setPrayers] = useState<string>('');

  const handleSubmit = async () => {
    const groupId = pathname.split('/')[1];
    const response = await createPrayers(groupId, prayers);
    if (response) {
      setTimeout(() => {
        window.location.href = `/${groupId}`;
      }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle="목장모임" />
      </header>
      <main className="flex w-full h-full py-28 align-top justify-center">
        <form className="flex flex-col w-full max-w-xl">
          <div>
            <label
              className="block text-gray-500 font-bold"
              htmlFor="inline-password"
            >
              기도
            </label>
            <textarea
              className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="inline-password"
              rows={10}
              value={prayers}
              onChange={(e) => setPrayers(e.target.value)}
            />
          </div>
          <div className="w-full">
            <button
              className="shadow w-full bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={handleSubmit}
            >
              기도 공유하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
