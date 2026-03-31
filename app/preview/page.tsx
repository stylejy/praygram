import Navbar from '../[groupId]/navbar';
import Praycard from '../[groupId]/parycard';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';

const MOCK_PRAYERS = [
  {
    id: '1',
    prayer: '이번 주 취업 면접이 있는데 하나님의 인도하심이 있기를 기도해요.',
    edited_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: { nickname: '김민준' },
    reaction: { prayCount: 5 },
  },
  {
    id: '2',
    prayer:
      '아버지 건강이 많이 안 좋으세요. 빠른 회복을 위해 함께 기도해주세요.\n검사 결과가 좋게 나오기를 간절히 바랍니다.',
    edited_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: { nickname: '이서연' },
    reaction: { prayCount: 12 },
  },
  {
    id: '3',
    prayer: '새로운 사역을 시작하는데 지혜와 용기를 주시기를 기도합니다.',
    edited_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: { nickname: '박지훈' },
    reaction: { prayCount: 3 },
  },
  {
    id: '4',
    prayer:
      '대학원 논문 마무리 중인데 집중력과 인내심을 허락해 주시기를 기도해요.',
    edited_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: { nickname: '최수아' },
    reaction: { prayCount: 7 },
  },
  {
    id: '5',
    prayer: '가정에 화목함이 넘치기를 기도합니다. 특히 남편과의 관계 회복을 위해 기도해주세요.',
    edited_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    user: { nickname: '정유진' },
    reaction: { prayCount: 9 },
  },
];

export default function PreviewGroupHome() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 pb-24">
      <header>
        <Navbar groupTitle="목장모임" />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl pt-24 pb-4">
        {MOCK_PRAYERS.map((prayer, index) => (
          <div
            key={prayer.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <Praycard
              prayer={prayer.prayer}
              time={prayer.edited_at}
              user={prayer.user.nickname}
              prayCount={prayer.reaction.prayCount}
            />
          </div>
        ))}
      </main>
      <Link href="/preview/add">
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
