'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  groupTitle: string;
}

export default function Navbar(props: Props) {
  const { groupTitle } = props;
  const router = useRouter();

  const handleGroupSwitch = () => {
    router.push('/groups');
  };

  return (
    <nav className="fixed inset-x-0 top-6 z-30 mx-4 w-auto bg-white/70 px-10 py-3 shadow-2xl backdrop-blur-lg rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex shrink-0">
          <a aria-current="page" className="flex items-center" href="/">
            <h1 className="text-xl font-extralight text-gray-500">Praygram</h1>
          </a>
        </div>
        <div className="md:flex md:items-center md:justify-center md:gap-5 text-gray-500">
          <button
            onClick={handleGroupSwitch}
            className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-white/50 transition-colors"
            title="다른 기도모임으로 전환"
          >
            <span>{groupTitle}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
