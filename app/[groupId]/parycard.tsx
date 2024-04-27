import { LiaPrayingHandsSolid } from 'react-icons/lia';

interface Props {
  prayer: string;
  time: string;
  user: string;
}

export default function Praycard(props: Props) {
  const { prayer, time, user } = props;
  return (
    <div className="flex flex-col items-center justify-center w-full h-fit bg-white/70 rounded-3xl shadow-md backdrop-blur-lg p-5">
      <header className="text-gray-400 font-semibold pb-2">
        {user}의 기도제목
      </header>
      <article className="text-wrap text-gray-700">{prayer}</article>
      <div className="flex flex-row items-center justify-end w-full pt-2">
        <time className="text-sm text-gray-400">{time}</time>
      </div>
      <button className="flex flex-row items-center justify-center w-fit h-10 mt-4 px-4 bg-slate-100 text-slate-500 border-2 border-slate-500 rounded-3xl">
        <LiaPrayingHandsSolid className="w-5 h-5" />
        <span className="pl-2">기도하기</span>
      </button>
    </div>
  );
}
