import React from 'react';

interface BananaSVGProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  collected?: boolean;
}

const BananaSVG: React.FC<BananaSVGProps> = ({ onClick, style, collected = false }) => {
  return (
    <svg
      width="48"
      height="72"
      viewBox="0 0 48 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={collected ? undefined : onClick}
      style={{
        cursor: !collected && onClick ? 'pointer' : 'default',
        opacity: collected ? 0 : 1,
        transition: 'opacity 0.4s ease',
        ...style,
      }}
      role={onClick ? 'button' : undefined}
      aria-label="Banana"
    >
      <defs>
        <style>{`
          .banana-group { animation: bananaFloat 3.5s ease-in-out infinite; transform-origin: 24px 6px; }
          .banana-stem { animation: bananaSway 3.5s ease-in-out infinite; transform-origin: 24px 2px; }
          @keyframes bananaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes bananaSway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        `}</style>
        <linearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE135" />
          <stop offset="50%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#E0A800" />
        </linearGradient>
        <filter id="bananaGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Rope/Vine */}
      <g className="banana-stem">
        <line x1="24" y1="0" x2="24" y2="12" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="2" r="3" fill="#4E342E" />
      </g>

      <g className="banana-group" filter="url(#bananaGlow)">
        {/* Banana bunch */}
        {/* Main banana (front) */}
        <path
          d="M24 14 Q8 20 6 36 Q4 48 16 54 Q24 56 30 50 Q38 44 38 32 Q38 20 24 14 Z"
          fill="url(#bananaGrad)"
          stroke="#D4A017"
          strokeWidth="1"
        />
        <path d="M24 14 Q18 22 16 32 Q14 42 20 48" stroke="#D4A017" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Second banana (behind left) */}
        <path
          d="M22 16 Q6 20 4 36 Q3 46 13 52"
          stroke="#F0B800"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />

        {/* Tip */}
        <path d="M16 54 Q14 60 16 62" stroke="#D4A017" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Sheen */}
        <path
          d="M28 18 Q36 24 36 32 Q36 38 32 44"
          stroke="rgba(255,255,220,0.5)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stem top */}
        <ellipse cx="24" cy="14" rx="5" ry="3" fill="#5D4037" />
      </g>
    </svg>
  );
};

export default BananaSVG;
