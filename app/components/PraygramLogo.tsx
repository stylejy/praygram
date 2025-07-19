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
        relative
        transform-gpu
      `}
      style={{
        background: `
          radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.9) 15%, rgba(255, 255, 255, 0.6) 35%, rgba(240, 240, 240, 0.8) 60%, rgba(220, 220, 220, 0.9) 100%),
          linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(200, 200, 200, 0.8))
        `,
        boxShadow: `
          0 8px 25px rgba(0, 0, 0, 0.12),
          0 4px 12px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05),
          inset 1px 1px 2px rgba(255, 255, 255, 0.6)
        `,
        backdropFilter: 'blur(25px)',
        transform: 'perspective(200px) rotateX(5deg)',
      }}
    >
      {/* Extreme top highlight for ultra convex effect */}
      <div
        className="absolute rounded-full"
        style={{
          top: '5%',
          left: '15%',
          width: '50%',
          height: '40%',
          background:
            'radial-gradient(ellipse, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 30%, transparent 80%)',
          filter: 'blur(0.5px)',
          transform: 'scale(1.1)',
        }}
      ></div>

      {/* Secondary highlight for extra depth */}
      <div
        className="absolute rounded-full"
        style={{
          top: '20%',
          left: '30%',
          width: '25%',
          height: '20%',
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      ></div>

      {/* Main glass surface with extreme curvature */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 25%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.05) 0%, transparent 40%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))
          `,
        }}
      ></div>

      {/* Emoji container with extreme depth */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${emojiSizeClasses[size]} relative z-10`}
          style={{
            textShadow: `
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 1px 2px rgba(0, 0, 0, 0.05)
            `,
            transform: 'translateZ(20px) scale(1.05)',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))',
          }}
        >
          🙏
        </span>
      </div>

      {/* Multiple bottom shadows for extreme depth */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '10%',
          left: '20%',
          width: '60%',
          height: '25%',
          background:
            'radial-gradient(ellipse, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.04) 50%, transparent 80%)',
          filter: 'blur(2px)',
        }}
      ></div>

      {/* Inner shadow for concave areas */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '25%',
          right: '25%',
          width: '35%',
          height: '30%',
          background:
            'radial-gradient(ellipse, rgba(0, 0, 0, 0.04) 0%, transparent 60%)',
          filter: 'blur(1px)',
        }}
      ></div>

      {/* Extreme outer rim highlight with rainbow effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            conic-gradient(
              from 0deg, 
              rgba(255, 255, 255, 0.3), 
              rgba(255, 255, 255, 0.1), 
              rgba(255, 255, 255, 0.4), 
              rgba(255, 255, 255, 0.05), 
              rgba(255, 255, 255, 0.3)
            )
          `,
          mask: 'radial-gradient(circle, transparent 85%, black 87%, black 92%, transparent 95%)',
          WebkitMask:
            'radial-gradient(circle, transparent 85%, black 87%, black 92%, transparent 95%)',
        }}
      ></div>

      {/* Ultra bright center reflection */}
      <div
        className="absolute rounded-full"
        style={{
          top: '15%',
          left: '25%',
          width: '15%',
          height: '15%',
          background:
            'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
          filter: 'blur(0.5px)',
        }}
      ></div>
    </div>
  );
}
