import React from 'react';

interface BoxSVGProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  isMoving?: boolean;
}

const BoxSVG: React.FC<BoxSVGProps> = ({ onClick, style, isMoving }) => {
  return (
    <svg
      width="72"
      height="64"
      viewBox="0 0 72 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      role={onClick ? 'button' : undefined}
      aria-label="Wooden box"
    >
      <defs>
        <style>{`
          .box-body { animation: ${isMoving ? 'boxWobble 0.18s ease-in-out infinite alternate' : 'none'}; transform-origin: 36px 44px; }
          .dust-puff-l { animation: ${isMoving ? 'dustPuff 0.35s ease-out infinite' : 'none'}; opacity: ${isMoving ? 0.7 : 0}; }
          .dust-puff-r { animation: ${isMoving ? 'dustPuff 0.35s ease-out 0.15s infinite' : 'none'}; opacity: ${isMoving ? 0.7 : 0}; }
          @keyframes boxWobble { 0%{transform:rotate(-1.5deg) translateY(-1px)} 100%{transform:rotate(1.5deg) translateY(0px)} }
          @keyframes dustPuff { 0%{transform:scale(0.4) translateY(0); opacity: 0.8} 100%{transform:scale(1.5) translateY(-8px); opacity: 0} }
        `}</style>
        <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4956A" />
          <stop offset="100%" stopColor="#A0622A" />
        </linearGradient>
        <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B080" />
          <stop offset="100%" stopColor="#C47840" />
        </linearGradient>
        <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#A0622A" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="36" cy="60" rx="28" ry="4" fill="rgba(0,0,0,0.18)" />

      {/* Dust puffs when sliding/pushing */}
      {isMoving && (
        <g>
          <g className="dust-puff-l" style={{ transformOrigin: '12px 58px' }}>
            <circle cx="12" cy="58" r="4.5" fill="#E2D9C8" />
            <circle cx="7" cy="56" r="3" fill="#D3C7B2" />
          </g>
          <g className="dust-puff-r" style={{ transformOrigin: '60px 58px' }}>
            <circle cx="60" cy="58" r="4.5" fill="#E2D9C8" />
            <circle cx="65" cy="56" r="3" fill="#D3C7B2" />
          </g>
        </g>
      )}

      <g className="box-body">
        {/* Top face */}
        <path d="M14 22 L36 14 L58 22 L36 30 Z" fill="url(#boxTop)" />
        <path d="M14 22 L36 14 L58 22 L36 30 Z" fill="none" stroke="#7A3B10" strokeWidth="1" />

        {/* Front face */}
        <path d="M14 22 L14 52 L36 56 L36 30 Z" fill="url(#boxFront)" />
        {/* Front wood planks */}
        <line x1="15" y1="33" x2="35" y2="37" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
        <line x1="15" y1="43" x2="35" y2="47" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
        {/* Front nails */}
        <circle cx="18" cy="29" r="1.5" fill="#444" />
        <circle cx="18" cy="49" r="1.5" fill="#444" />
        <circle cx="32" cy="31" r="1.5" fill="#444" />
        <circle cx="32" cy="51" r="1.5" fill="#444" />

        {/* Right face */}
        <path d="M36 30 L36 56 L58 52 L58 22 Z" fill="url(#boxSide)" />
        {/* Right wood planks */}
        <line x1="37" y1="37" x2="57" y2="33" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
        <line x1="37" y1="47" x2="57" y2="43" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
        {/* Right nails */}
        <circle cx="40" cy="31" r="1.5" fill="#444" />
        <circle cx="40" cy="51" r="1.5" fill="#444" />
        <circle cx="54" cy="29" r="1.5" fill="#444" />
        <circle cx="54" cy="49" r="1.5" fill="#444" />

        {/* Edges */}
        <path d="M14 22 L14 52 L36 56 L58 52 L58 22 L36 30 Z" fill="none" stroke="#7A3B10" strokeWidth="1.6" strokeLinejoin="round" />
        <line x1="36" y1="14" x2="36" y2="56" stroke="#7A3B10" strokeWidth="1.2" strokeDasharray="3,2" opacity="0.6" />

        {/* Brand stamp */}
        <rect x="22" y="36" width="12" height="9" rx="2" fill="rgba(0,0,0,0.12)" />
        <text x="25" y="43" fontSize="5.5" fill="rgba(255,255,255,0.6)" fontWeight="bold" fontFamily="sans-serif">HEAVY</text>
      </g>
    </svg>
  );
};

export default BoxSVG;
