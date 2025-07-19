interface PraygramLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const emojiSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function PraygramLogo({
  size = 'lg',
  className = '',
}: PraygramLogoProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${className}
        rounded-full 
        bg-gradient-to-br from-gray-100 to-gray-200
        flex items-center justify-center 
        shadow-lg
        backdrop-blur-sm
        border border-white/50
        relative
        overflow-hidden
      `}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>

      {/* Emoji */}
      <span className={`${emojiSizeClasses[size]} relative z-10`}>🙏</span>

      {/* Inner glow */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
    </div>
  );
}
