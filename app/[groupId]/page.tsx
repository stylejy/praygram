import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { getGroupPrayers } from '@/apis/prayers';
import { getGroup } from '@/apis/groups';
import { PrayerWithReactions } from '@/types/prayer';

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupHome({ params }: Props) {
  const { groupId } = await params;

  let prayers: PrayerWithReactions[] = [];
  let group = { name: '로딩 중...' };

  try {
    prayers = await getGroupPrayers(groupId);
    group = await getGroup(groupId);
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle={group.name} />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full h-full py-28 align-top">
        {prayers?.map((prayer) => (
          <Praycard key={prayer.id} prayer={prayer} />
        ))}
      </main>
      <Link href={`/${groupId}/add`}>
        <button className="flex items-center fixed bottom-7 right-4 w-30 h-14 px-5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
          <FaPlus className="w-5 h-5 mr-2" />
          기도제목 추가
        </button>
      </Link>
    </div>
  );
}
