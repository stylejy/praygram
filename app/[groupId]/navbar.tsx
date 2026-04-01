'use client';

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
    <nav
      className="glass-navbar fixed inset-x-0 z-50 mx-4 flex items-center justify-between px-5 py-3.5 rounded-2xl md:mx-0 md:rounded-none md:px-8 md:top-0"
      style={{ top: 'env(safe-area-inset-top, 0.75rem)' }}
    >
      <button
        onClick={handleGroupSwitch}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        ← 그룹
      </button>
      <span className="text-sm font-semibold text-gray-900 tracking-tight">
        {groupTitle}
      </span>
      <div className="w-10" />
    </nav>
  );
}
