import Image from 'next/image';
import Navbar from './navbar';
import Praycard from './parycard';
import { FaPlus } from 'react-icons/fa';

interface Props {
  params: { groupId: string };
}
export default function GroupHome(props: Props) {
  const {
    params: { groupId },
  } = props;
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle="지구촌교회-12지구" />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full h-full py-28 align-top">
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="YOUNG"
          prayCount={10}
        />
        <Praycard
          prayer="주님 학원을 허락하여 주시고 잘 이끌어주시니 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="SUNA"
          prayCount={3}
        />
        <Praycard
          prayer="주님 재정적으로 풍성하고 넘치도록 허락하여 주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="YOUNG"
          prayCount={6}
        />
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="YOUNG"
          prayCount={3}
        />
        <Praycard
          prayer="주님 학원을 허락하여 주시고 잘 이끌어주시니 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="SUNA"
          prayCount={399}
        />
        <Praycard
          prayer="주님 재정적으로 풍성하고 넘치도록 허락하여 주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="YOUNG"
          prayCount={10000}
        />
      </main>
      <button className="flex items-center fixed bottom-7 right-4 w-30 h-14 px-5 bg-slate-100 text-slate-500 rounded-full shadow-md">
        <FaPlus className="w-5 h-5 mr-2" />
        나의 기도 제목
      </button>
    </div>
  );
}
