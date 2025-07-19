'use client';

import { useRouter } from 'next/navigation';
import { PraygramLogo } from '@/app/components/PraygramLogo';

interface Props {
  groupTitle: string;
}

export default function Navbar(props: Props) {
  const { groupTitle } = props;
  const router = useRouter();

  const handleGroupSwitch = () => {
    router.push('/groups');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <nav
      className="glass-navbar fixed inset-x-0 z-50 mx-6 rounded-2xl"
      style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <button
          onClick={handleHome}
          className="flex items-center space-x-2 group"
        >
          <PraygramLogo size="sm" />
          <h1 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-all duration-300">
            Praygram
          </h1>
        </button>

        {/* Group Selector */}
        <button
          onClick={handleGroupSwitch}
          className="glass-button flex items-center space-x-3 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-200"
          title="다른 기도모임으로 전환"
        >
          <span className="font-medium text-gray-700 max-w-32 truncate">
            {groupTitle}
          </span>
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200/50">
            <svg
              className="w-3 h-3 text-gray-600 transition-transform duration-200 group-hover:rotate-180"
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
          </div>
        </button>
      </div>
    </nav>
  );
}
