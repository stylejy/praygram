'use client';

import { useEffect, useState } from 'react';
import { PraygramLogo } from './PraygramLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // PWA로 실행 중인지 확인
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsInStandaloneMode(isStandalone);

    // iOS 감지
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 이전에 거절했는지 확인
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const dismissedDate = new Date(dismissedTime);
      const daysSinceDismissed =
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // 7일 이내에 거절했으면 표시하지 않음
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // 이미 PWA로 실행 중이면 표시하지 않음
    if (isStandalone) {
      return;
    }

    // Android Chrome의 beforeinstallprompt 이벤트 처리
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS는 beforeinstallprompt가 없으므로 직접 표시
    if (isIOSDevice && !isStandalone) {
      // 첫 방문 후 3초 뒤에 표시
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android Chrome 설치
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA 설치됨');
      } else {
        console.log('PWA 설치 거절됨');
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt || isInStandaloneMode) {
    return null;
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleDismiss}
      />

      {/* 설치 프롬프트 다이얼로그 */}
      <div className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto animate-slide-up">
        <div className="glass-card p-6 rounded-3xl shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <PraygramLogo size="sm" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Praygram 앱으로 설치
                </h3>
                <p className="text-sm text-gray-600">
                  홈 화면에서 빠르게 실행하세요
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 특징 목록 */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span>
              <span>오프라인에서도 기도제목 확인</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span>
              <span>빠른 앱 실행 및 알림 수신</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span>
              <span>홈 화면에서 바로 접근</span>
            </div>
          </div>

          {/* 버튼 */}
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Safari에서
                <span className="inline-flex items-center mx-1 px-2 py-1 bg-gray-100 rounded-lg">
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.632 4.658C17.886 17.938 17 18.482 17 19c0 1.657-3.134 3-7 3s-7-1.343-7-3c0-.518.886-1.062 1.684-1.484m13.632 0c1.238-.848 2.684-1.341 2.684-2.516 0-1.657-3.134-3-7-3s-7 1.343-7 3c0 1.175 1.446 1.668 2.684 2.516M9 13h6"
                    />
                  </svg>
                </span>
                버튼을 눌러
              </p>
              <p className="text-sm text-gray-600 text-center">
                &quot;홈 화면에 추가&quot;를 선택하세요
              </p>
              <button
                onClick={handleDismiss}
                className="primary-button w-full py-3 px-4 rounded-xl font-semibold text-white"
              >
                알겠습니다
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleDismiss}
                className="glass-button flex-1 py-3 px-4 rounded-xl font-medium text-gray-700"
              >
                나중에
              </button>
              <button
                onClick={handleInstall}
                className="primary-button flex-1 py-3 px-4 rounded-xl font-semibold text-white"
              >
                설치하기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 애니메이션 스타일 추가
const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// 스타일 주입
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
