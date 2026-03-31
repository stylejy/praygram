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
    <div className="glass-card glass-card-hover flex flex-col p-6 gap-3">
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {user}
        </span>
        <time
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {getFormattedTime(time)}
        </time>
      </div>

      <div
        className="text-[15px] leading-relaxed"
        style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--divider)', paddingTop: '12px' }}
      >
        <pre className="whitespace-pre-wrap break-words font-[inherit]">{prayer}</pre>
      </div>

      {/**
      <div className="flex items-center gap-2 mt-2 pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
        <button className="btn-secondary flex items-center justify-center gap-1.5 !w-auto !py-2 !px-4 !text-sm">
          <LiaPrayingHandsSolid className="w-4 h-4" />
          기도하기
        </button>
        {prayCount !== 0 && (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {prayCount}번의 기도를 받았어요
          </span>
        )}
      </div>
      **/}
    </div>
  );
}
