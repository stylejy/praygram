'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
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
    const shouldPreviewPrompt =
      process.env.NODE_ENV === 'development' &&
      new URLSearchParams(window.location.search).has('showPwaPrompt');

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
      if (daysSinceDismissed < 7 && !shouldPreviewPrompt) {
        return;
      }
    }

    // 이미 PWA로 실행 중이면 표시하지 않음
    if (isStandalone && !shouldPreviewPrompt) {
      return;
    }

    if (shouldPreviewPrompt) {
      setShowPrompt(true);
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
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-[60] mx-auto max-w-sm md:bottom-6">
      <div
        role="dialog"
        aria-label="Praygram 앱 설치 안내"
        className="pointer-events-auto rounded-lg border border-[color:var(--accent-border)] bg-[rgba(255,253,248,0.96)] p-3 shadow-[0_16px_42px_rgba(74,57,128,0.14)] backdrop-blur-xl slide-up"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <PraygramLogo size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-semibold leading-5 text-[color:var(--text-primary)]">
              홈 화면에 추가
            </h3>
            <p className="truncate text-[12px] leading-4 text-[color:var(--text-secondary)]">
              {isIOS
                ? 'Safari 공유 버튼에서 추가'
                : '기도제목을 바로 열어보세요.'}
            </p>
          </div>
          {isIOS ? (
            <button
              onClick={handleDismiss}
              className="primary-button flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-[13px] font-semibold text-white transition active:scale-[0.99]"
            >
              확인
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="primary-button flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-semibold text-white transition active:scale-[0.99]"
            >
              <FaPlus size={11} />
              설치
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[rgba(117,98,214,0.1)] hover:text-[color:var(--text-primary)] active:scale-95"
            aria-label="설치 안내 닫기"
          >
            <FaTimes size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
