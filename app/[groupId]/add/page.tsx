interface Props {
  params: { groupId: string };
}
export default function Add(props: Props) {
  const {
    params: { groupId },
  } = props;
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4">
      기도 제목 입력
    </div>
  );
}
