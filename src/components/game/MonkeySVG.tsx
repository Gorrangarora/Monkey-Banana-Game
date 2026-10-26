import React from 'react';

interface MonkeySVGProps {
  onBox: boolean;
  hasBanana: boolean;
  isWalking?: boolean;
  isClimbing?: boolean;
  isGrabbing?: boolean;
  isCelebrating?: boolean;
  isPushing?: boolean;
  isJumping?: boolean;
  pushDirection?: 'left' | 'right';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const MonkeySVG: React.FC<MonkeySVGProps> = ({
  onBox,
  hasBanana,
  isWalking = false,
  isClimbing = false,
  isGrabbing = false,
  isCelebrating = false,
  isPushing = false,
  isJumping = false,
  pushDirection = 'right',
  onClick,
  style,
}) => {
  const legAnim = isWalking || isPushing ? 'walk' : '';
  const bodyAnim = isCelebrating
    ? 'celebrate'
    : isJumping || isClimbing
    ? 'jump'
    : isPushing
    ? 'push'
    : 'idle';

  const pushAngle = isPushing ? (pushDirection === 'right' ? 14 : -14) : 0;

  return (
    <svg
      width="75"
      height="92"
      viewBox="0 0 75 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transform: `rotate(${pushAngle}deg)`,
        transition: 'transform 0.25s ease-out',
        ...style,
      }}
      role={onClick ? 'button' : undefined}
      aria-label="Monkey character"
    >
      <defs>
        <style>{`
          .monkey-body { animation: ${
            bodyAnim === 'idle'
              ? 'monkeyBreathe 3s ease-in-out infinite'
              : bodyAnim === 'celebrate'
              ? 'monkeyCelebrate 0.35s ease-in-out infinite alternate'
              : bodyAnim === 'jump'
              ? 'monkeyJumpBounce 0.4s ease-in-out infinite alternate'
              : bodyAnim === 'push'
              ? 'monkeyPushStrain 0.3s ease-in-out infinite alternate'
              : 'none'
          }; transform-origin: 37px 46px; }
          .monkey-leg-l { animation: ${legAnim === 'walk' ? 'walkLegL 0.35s ease-in-out infinite alternate' : 'none'}; transform-origin: 30px 66px; }
          .monkey-leg-r { animation: ${legAnim === 'walk' ? 'walkLegR 0.35s ease-in-out infinite alternate' : 'none'}; transform-origin: 44px 66px; }
          .monkey-arm-l { animation: ${isPushing ? 'pushArmL 0.3s ease-in-out infinite alternate' : isJumping ? 'jumpArmUp 0.4s ease-in-out infinite alternate' : 'none'}; transform-origin: 24px 48px; }
          .monkey-arm-r { animation: ${
            isGrabbing
              ? 'grabArm 0.4s ease-in-out forwards'
              : isCelebrating
              ? 'celebrateArm 0.3s ease-in-out infinite alternate'
              : isPushing
              ? 'pushArmR 0.3s ease-in-out infinite alternate'
              : isJumping
              ? 'jumpArmUp 0.4s ease-in-out infinite alternate'
              : 'none'
          }; transform-origin: 50px 48px; }
          .monkey-eye { animation: monkeyBlink 4s ease-in-out infinite; transform-origin: center; }

          @keyframes monkeyBreathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.03)} }
          @keyframes monkeyCelebrate { 0%{transform:translateY(0) rotate(-6deg)} 100%{transform:translateY(-8px) rotate(6deg)} }
          @keyframes monkeyJumpBounce { 0%{transform:translateY(2px) scale(1.04, 0.96)} 100%{transform:translateY(-14px) scale(0.95, 1.05)} }
          @keyframes monkeyPushStrain { 0%{transform:translateY(0) translateX(-2px)} 100%{transform:translateY(2px) translateX(3px)} }
          @keyframes walkLegL { 0%{transform:rotate(-24deg)} 100%{transform:rotate(24deg)} }
          @keyframes walkLegR { 0%{transform:rotate(24deg)} 100%{transform:rotate(-24deg)} }
          @keyframes pushArmL { 0%{transform:rotate(-35deg)} 100%{transform:rotate(-45deg)} }
          @keyframes pushArmR { 0%{transform:rotate(35deg)} 100%{transform:rotate(45deg)} }
          @keyframes jumpArmUp { 0%{transform:rotate(-120deg)} 100%{transform:rotate(-140deg)} }
          @keyframes grabArm { 0%{transform:rotate(0deg)} 60%{transform:rotate(-90deg) translateX(-6px)} 100%{transform:rotate(-80deg) translateX(-4px)} }
          @keyframes celebrateArm { 0%{transform:rotate(-60deg)} 100%{transform:rotate(-120deg)} }
          @keyframes monkeyBlink { 0%,89%,100%{transform:scaleY(1)} 92%{transform:scaleY(0.1)} }
        `}</style>
      </defs>

      {/* Shadow */}
      <ellipse
        cx="37"
        cy="88"
        rx={isJumping ? 10 : 20}
        ry="4"
        fill="rgba(0,0,0,0.14)"
        opacity={isJumping ? 0.35 : 0.7}
      />

      {/* Body group */}
      <g className="monkey-body">
        {/* Tail */}
        <path
          d={isJumping ? "M50 62 Q66 45 60 30 Q54 22 46 26" : "M50 62 Q62 55 64 45 Q66 36 60 34"}
          stroke="#8B4513"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="37" cy="56" rx="16" ry="18" fill="#C68642" />
        {/* Belly patch */}
        <ellipse cx="37" cy="58" rx="10" ry="12" fill="#F5DEB3" />

        {/* Left arm */}
        <g className="monkey-arm-l">
          <path
            d={isPushing ? "M24 48 Q10 40 4 44" : isJumping ? "M24 48 Q14 30 12 18" : "M24 48 Q14 55 16 64"}
            stroke="#C68642"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx={isPushing ? 3 : isJumping ? 11 : 15}
            cy={isPushing ? 44 : isJumping ? 17 : 66}
            rx="5"
            ry="4"
            fill="#C68642"
          />
        </g>

        {/* Right arm */}
        <g className="monkey-arm-r">
          <path
            d={isPushing ? "M50 48 Q64 40 70 44" : isJumping ? "M50 48 Q60 30 62 18" : "M50 48 Q60 55 59 64"}
            stroke="#C68642"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx={isPushing ? 71 : isJumping ? 63 : 59}
            cy={isPushing ? 44 : isJumping ? 17 : 66}
            rx="5"
            ry="4"
            fill="#C68642"
          />
          {hasBanana && (
            <path d="M59 63 Q64 58 67 55" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* Head */}
        <ellipse cx="37" cy="35" rx="18" ry="17" fill="#C68642" />
        {/* Face patch */}
        <ellipse cx="37" cy="38" rx="12" ry="10" fill="#F5DEB3" />

        {/* Left ear */}
        <ellipse cx="19" cy="33" rx="5.5" ry="5.5" fill="#C68642" />
        <ellipse cx="19" cy="33" rx="3.5" ry="3.5" fill="#D4956A" />

        {/* Right ear */}
        <ellipse cx="55" cy="33" rx="5.5" ry="5.5" fill="#C68642" />
        <ellipse cx="55" cy="33" rx="3.5" ry="3.5" fill="#D4956A" />

        {/* Eyes */}
        <g className="monkey-eye">
          <ellipse cx="31" cy="32" rx="4.5" ry="5" fill="white" />
          <ellipse cx="31" cy="33" rx="2.8" ry="3.2" fill="#2C1810" />
          <ellipse cx="30.2" cy="31.5" rx="1" ry="1" fill="white" />
        </g>
        <g className="monkey-eye">
          <ellipse cx="43" cy="32" rx="4.5" ry="5" fill="white" />
          <ellipse cx="43" cy="33" rx="2.8" ry="3.2" fill="#2C1810" />
          <ellipse cx="42.2" cy="31.5" rx="1" ry="1" fill="white" />
        </g>

        {/* Nose */}
        <ellipse cx="36" cy="38.5" rx="2" ry="1.2" fill="#8B4513" />
        <ellipse cx="38" cy="38.5" rx="2" ry="1.2" fill="#8B4513" />

        {/* Mouth */}
        {isCelebrating || isJumping ? (
          <path d="M31 42 Q37 49 43 42" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" fill="#D4956A" />
        ) : isPushing ? (
          <path d="M32 44 Q37 41 42 44" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M33 42 Q37 46 41 42" stroke="#8B4513" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        )}

        {/* Sweat droplet when pushing */}
        {isPushing && (
          <path
            d="M52 24 C52 24 55 27 55 29 C55 31 53 32 52 32 C51 32 49 31 49 29 C49 27 52 24 52 24 Z"
            fill="#38BDF8"
            opacity="0.9"
          />
        )}

        {/* Celebration sparkles */}
        {isCelebrating && (
          <>
            <text x="24" y="18" fontSize="11" style={{ animation: 'sparkleAnim 0.5s ease infinite alternate' }}>⭐</text>
            <text x="44" y="16" fontSize="9" style={{ animation: 'sparkleAnim 0.5s ease 0.2s infinite alternate' }}>✨</text>
          </>
        )}
      </g>

      {/* Legs */}
      <g className="monkey-leg-l">
        <path
          d={isJumping ? "M30 71 Q22 75 26 80" : "M30 71 Q26 79 24 86"}
          stroke="#C68642"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={isJumping ? 27 : 23} cy={isJumping ? 81 : 87} rx="5" ry="3" fill="#8B4513" />
      </g>
      <g className="monkey-leg-r">
        <path
          d={isJumping ? "M44 71 Q52 75 48 80" : "M44 71 Q48 79 50 86"}
          stroke="#C68642"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={isJumping ? 47 : 51} cy={isJumping ? 81 : 87} rx="5" ry="3" fill="#8B4513" />
      </g>
    </svg>
  );
};

export default MonkeySVG;
