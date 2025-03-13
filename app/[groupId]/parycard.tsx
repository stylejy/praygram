import { getFormattedTime } from '@/lib/timeFormatter';
import { LiaPrayingHandsSolid } from 'react-icons/lia';

interface Props {
  prayer: string;
  time: string;
  user: string;
  prayCount: number;
}

export default function Praycard(props: Props) {
  const { prayer, time, user, prayCount } = props;
  return (
    <div className="flex flex-col items-center justify-center w-full h-fit bg-white/70 rounded-3xl shadow-md backdrop-blur-lg p-5">
      <header className="text-gray-400 font-semibold">
        {user} 님의 기도제목
      </header>
      <div className="flex flex-row items-center justify-center w-full pb-4">
        <time className="text-xs text-gray-400">{getFormattedTime(time)}</time>
      </div>
      <article className="text-wrap text-gray-700">
        <pre className="whitespace-pre-wrap break-words">{prayer}</pre>
      </article>
      <div className="flex flex-col items-center justify-center mt-4">
        <button className="flex flex-row items-center justify-center w-fit h-10 px-3  bg-slate-100 text-slate-500 border-2 border-slate-500 rounded-3xl">
          <LiaPrayingHandsSolid className="w-4 h-4" />
          <span className="pl-1 text-sm">기도하기</span>
        </button>
        {prayCount !== 0 && (
          <span className="text-sm mt-2 text-gray-400">
            {prayCount}번의 기도를 받았어요!
          </span>
        )}
      </div>
    </div>
  );
}
