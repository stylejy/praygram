import { PageProps } from '@/.next/types/app/page';
import Navbar from '../navbar';

interface Props {
  params: Promise<{ groupId: string }>;
}
export default async function Add({ params }: Props) {
  const { groupId } = await params;
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      <header>
        <Navbar groupTitle="목장모임" />
      </header>
      <main className="flex w-full h-full py-28 align-top justify-center">
        <form className="flex flex-col w-full max-w-sm gap-y-5">
          <div>
            <label
              className="block text-gray-500 font-bold "
              htmlFor="inline-full-name"
            >
              이름
            </label>
            <input
              className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              type="text"
            />
          </div>
          <div>
            <label
              className="block text-gray-500 font-bold"
              htmlFor="inline-password"
            >
              기도
            </label>
            <textarea
              className="bg-gray-100 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="inline-password"
              rows={10}
            />
          </div>
          <div className="w-full">
            <button
              className="shadow w-full bg-gray-500 hover:bg-gray-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="button"
            >
              기도 공유하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
