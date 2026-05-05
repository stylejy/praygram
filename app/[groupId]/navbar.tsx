'use client';

import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa';
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

  return (
    <nav className="quiet-header fixed inset-x-0 top-0 z-50">
      <div className="relative mx-auto flex h-[72px] w-full max-w-2xl items-center px-4 md:px-0">
        <button
          onClick={handleGroupSwitch}
          className="quiet-icon-button absolute left-[4.5px] top-1/2 shrink-0 -translate-y-1/2 md:-left-[14px]"
          aria-label="그룹 목록으로 이동"
        >
          <FaChevronLeft size={13} />
        </button>
        <div className="ml-12 flex min-w-0 flex-1 items-center gap-2.5">
          <PraygramLogo size="sm" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold leading-4 text-[color:var(--primary)]">
              기도모임
            </p>
            <h1 className="truncate text-[17px] font-semibold leading-6 text-[color:var(--text-primary)]">
              {groupTitle}
            </h1>
          </div>
        </div>
        <div className="w-9 shrink-0" />
      </div>
    </nav>
  );
}
