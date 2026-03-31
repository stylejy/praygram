import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { getGroupPrayers } from '@/apis/prayers';
import { getGroup } from '@/apis/groups';

interface Props {
  params: Promise<{ groupId: string }>;
}
export default async function GroupHome({ params }: Props) {
  const { groupId } = await params;

  const prayers = await getGroupPrayers(groupId);
  const group = await getGroup(groupId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 pb-24">
      <header>
        <Navbar groupTitle={group.name} />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl pt-24 pb-4">
        {prayers?.map((prayer, index) => (
          <div
            key={prayer.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Praycard
              prayer={prayer.prayer}
              time={prayer.edited_at}
              user={prayer.user.nickname}
              prayCount={prayer.reaction?.prayCount ?? 0}
            />
          </div>
        ))}
      </main>
      <Link href={`/${groupId}/add`}>
        <button
          className="glass-card fixed bottom-6 right-5 flex items-center gap-2 px-5 py-3.5 transition-all active:scale-95 hover:shadow-lg"
          style={{ borderRadius: '100px', color: 'var(--accent)' }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">나의 기도 제목</span>
        </button>
      </Link>
    </div>
  );
}
