import Image from 'next/image';

interface Props {
  groupTitle: string;
}
export default function Navbar(props: Props) {
  const { groupTitle } = props;
  return (
    <nav className="fixed inset-x-0 top-6 z-30 mx-4 w-auto bg-white/70 px-10 py-3 shadow-lg backdrop-blur-lg rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex shrink-0">
          <a aria-current="page" className="flex items-center" href="/">
            <h1 className="text-xl font-extralight text-gray-500">Praygram</h1>
          </a>
        </div>
        <div className="hidden md:flex md:items-center md:justify-center md:gap-5">
          <p>{groupTitle}</p>
        </div>
      </div>
    </nav>
  );
}
