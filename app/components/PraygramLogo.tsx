import Image from 'next/image';

interface PraygramLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function PraygramLogo({
  size = 'lg',
  className = '',
  label = 'Praygram',
}: PraygramLogoProps) {
  return (
    <Image
      src="/icons/praygram-icon-source.png"
      alt={label}
      width={80}
      height={80}
      unoptimized
      className={`${sizeClasses[size]} ${className} shrink-0 rounded-[22%] object-cover`}
      draggable={false}
    />
  );
}
