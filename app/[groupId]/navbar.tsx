'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PraygramLogo } from '@/app/components/PraygramLogo';

interface Props {
  groupTitle: string;
  groupId: string;
}

export default function Navbar(props: Props) {
  const { groupTitle, groupId } = props;
  const router = useRouter();
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleGroupSwitch = () => {
    router.push('/groups');
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/join/${groupId}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 폴백: 텍스트 선택
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  return (
    <nav className="glass-navbar fixed inset-x-0 top-6 z-50 mx-6 rounded-2xl">
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

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          {/* Invite Button */}
          <div className="relative">
            <button
              onClick={handleInvite}
              className="primary-button flex items-center space-x-2 px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-200"
              title="초대 링크 복사"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
              <span className="text-sm font-medium">초대</span>
            </button>

            {/* Copy Success Toast */}
            {showCopySuccess && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap slide-up">
                초대 링크가 복사되었습니다! 📋
              </div>
            )}
          </div>

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
      </div>
    </nav>
  );
}
