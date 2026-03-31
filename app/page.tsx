'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="animate-fade-in flex flex-col items-center gap-8">
        <h1
          className="text-4xl font-light tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Praygram
        </h1>
        <div className="spinner" />
      </div>
    </main>
  );
}
