import Image from 'next/image';
import Navbar from './navbar';
import Praycard from './parycard';

interface Props {
  params: { groupId: string };
}
export default function GroupHome(props: Props) {
  const {
    params: { groupId },
  } = props;
  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-4">
      <header>
        <Navbar groupTitle="지구촌교회-12지구" />
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full h-screen py-28 align-top">
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="주영"
        />
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="주영"
        />
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="주영"
        />
        <Praycard
          prayer="주님 기도를 잘 모을 수 있는 앱을 만들 수 있게 해주셔서 감사합니다!"
          time="2024년 4월 27일 오후 1시 53분"
          user="주영"
        />
      </main>
    </div>
  );
}
