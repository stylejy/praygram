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
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 w-full py-28">
        <Praycard />
        <Praycard />
        <Praycard />
        <Praycard />
        <Praycard />
        <Praycard />
        <Praycard />
        <Praycard />
      </main>
    </div>
  );
}
