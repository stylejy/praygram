'use client';

import { PWAInstallPrompt } from './PWAInstallPrompt';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
