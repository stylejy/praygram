import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { getGroupPrayers } from '@/apis/prayers';
import { get } from 'http';
import { getGroup } from '@/apis/groups';

interface Props {
  params: Promise<{ groupId: string }>;
}
export default async function GroupHome({ params }: Props) {
  const { groupId } = await params;

  const prayers = await getGroupPrayers(groupId);
  const group = await getGroup(groupId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle={group.name} />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full h-full py-28 align-top">
        {prayers?.map((prayer) => (
          <Praycard
            key={prayer.id}
            prayer={prayer.prayer}
            time={prayer.edited_at}
            user={prayer.user.nickname}
            prayCount={prayer.reaction?.prayCount ?? 0}
          />
        ))}
      </main>
      <Link href={`/${groupId}/add`}>
        <button className="flex items-center fixed bottom-7 right-4 w-30 h-14 px-5 bg-slate-100 text-slate-500 rounded-full shadow-md">
          <FaPlus className="w-5 h-5 mr-2" />
          나의 기도 제목
        </button>
      </Link>
    </div>
  );
}
