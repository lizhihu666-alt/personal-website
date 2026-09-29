import React from 'react';

export type CharacterAction =
  | 'idle'
  | 'look-left'
  | 'look-right'
  | 'sit-desk'
  | 'swing-racket';

interface LeoCharacterProps {
  action?: CharacterAction;
  facing?: 'front' | 'left' | 'right';
  className?: string;
}

export const LeoCharacter: React.FC<LeoCharacterProps> = ({
  action = 'idle',
  facing = 'front',
  className = '',
}) => {
  // Determine computed facing direction based on action or prop
  const currentFacing =
    action === 'look-left' ? 'left' :
    action === 'swing-racket' || action === 'look-right' ? 'right' :
    action === 'sit-desk' ? 'left' : facing;

  const isSitting = action === 'sit-desk';
  const isSwinging = action === 'swing-racket';
  const isIdle = action === 'idle';

  return (
    <div className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}>
      {/* Desk and Chair when sitting at work */}
      {isSitting && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 280 280"
            className="w-full h-full overflow-visible"
            aria-hidden="true"
          >
            {/* Soft ground shadow under desk & chair */}
            <ellipse cx="140" cy="235" rx="75" ry="7" fill="#1B2430" opacity="0.6" />
            
            {/* Ergonomic Office Chair back & base */}
            <path
              d="M 172 135 C 180 135 186 142 186 150 L 186 195 C 186 200 182 205 176 205 L 168 205 Z"
              fill="#1B2A47"
            />
            {/* Chair seat */}
            <rect x="150" y="195" width="40" height="8" rx="3" fill="#22355C" />
            {/* Chair stem & wheels */}
            <line x1="168" y1="203" x2="168" y2="232" stroke="#5C6B80" strokeWidth="4" strokeLinecap="round" />
            <path d="M 152 232 L 184 232" stroke="#3E4A5C" strokeWidth="3" strokeLinecap="round" />
            <circle cx="152" cy="234" r="2.5" fill="#1E2C45" />
            <circle cx="184" cy="234" r="2.5" fill="#1E2C45" />

            {/* Minimalist Solid Wood Desk */}
            {/* Desk Surface */}
            <rect x="65" y="180" width="95" height="7" rx="2" fill="#333B46" stroke="#3A424E" strokeWidth="1" />
            {/* Desk Legs */}
            <line x1="72" y1="187" x2="72" y2="234" stroke="#4A5361" strokeWidth="3" strokeLinecap="round" />
            <line x1="152" y1="187" x2="152" y2="234" stroke="#4A5361" strokeWidth="3" strokeLinecap="round" />
            <line x1="72" y1="210" x2="152" y2="210" stroke="#3A424E" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Laptop on desk */}
            {/* Base */}
            <rect x="92" y="176" width="38" height="4" rx="1" fill="#4A5361" />
            {/* Open Display */}
            <path
              d="M 104 150 L 126 153 L 124 176 L 102 176 Z"
              fill="#1E2C45"
              stroke="#3E4A5C"
              strokeWidth="1"
            />
            {/* Screen inner glow */}
            <polygon
              points="106,153 124,155 122,174 104,174"
              fill="#E8F1FF"
              opacity="0.9"
            >
              <animate
                attributeName="opacity"
                values="0.85;0.98;0.88;0.95"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </polygon>
            {/* Screen light cone */}
            <polygon
              points="106,155 145,145 142,185 104,174"
              fill="#E8F1FF"
              opacity="0.08"
            />

            {/* Ceramic Coffee Mug on desk */}
            <rect x="76" y="169" width="9" height="11" rx="2" fill="#EDF1F7" stroke="#3A424E" strokeWidth="1" />
            <path d="M 76 172 C 73 172 73 176 76 177" stroke="#3A424E" strokeWidth="1" fill="none" />
            {/* Small steam */}
            <path d="M 79 166 C 81 163 79 160 81 157" stroke="#333B46" strokeWidth="1" fill="none" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
      )}

      {/* Main Vector Illustration of Leo */}
      <svg
        viewBox="0 0 160 220"
        className={`w-full h-full overflow-visible transition-transform duration-300 ${
          currentFacing === 'left' ? 'scale-x-[-1]' : ''
        }`}
        aria-label="Editorial illustration of Leo"
      >
        <defs>
          <filter id="gentle-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#111A2C" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Dynamic Ground Shadow */}
        <ellipse
          cx="80"
          cy="210"
          rx={isSitting ? "30" : "28"}
          ry="5"
          fill="#111A2C"
          opacity="0.12"
        />

        {/* ROOT CHARACTER CONTAINER */}
        <g className={`transition-transform duration-200 ${isIdle ? 'leo-breathing-bob' : ''}`}>

          {/* ==================== LEGS ==================== */}
          {!isSitting ? (
            <g id="legs">
              {/* Back Leg (Right leg visually) */}
              <g style={{ transformOrigin: '84px 145px' }}>
                <line
                  x1="84"
                  y1="145"
                  x2="84"
                  y2="198"
                  stroke="#1A2433"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                {/* Back Minimalist Sneaker */}
                <path
                  d="M 82 198 L 94 198 C 96 198 97 201 95 204 L 80 204 C 79 204 79 200 81 198 Z"
                  fill="#E4E9F1"
                  stroke="#5A6578"
                  strokeWidth="1.2"
                />
              </g>

              {/* Front Leg (Left leg visually) */}
              <g style={{ transformOrigin: '74px 145px' }}>
                <line
                  x1="74"
                  y1="145"
                  x2="74"
                  y2="200"
                  stroke="#141E2E"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {/* Front Minimalist Sneaker */}
                <path
                  d="M 72 200 L 87 200 C 90 200 90 205 88 206 L 70 206 C 68 206 69 202 72 200 Z"
                  fill="#FFFFFF"
                  stroke="#4E5A6C"
                  strokeWidth="1.2"
                />
              </g>
            </g>
          ) : (
            /* Sitting Bent Legs */
            <g id="sitting-legs">
              {/* Thigh (horizontal) */}
              <path
                d="M 80 148 L 52 165 L 50 200"
                stroke="#16202F"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Sneaker resting on floor */}
              <path
                d="M 46 200 L 32 200 C 30 200 30 205 33 206 L 52 206 C 53 206 53 201 50 200 Z"
                fill="#FFFFFF"
                stroke="#4E5A6C"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* ==================== TORSO / CLOTHING ==================== */}
          <g id="torso">
            {/* Belt / Waist boundary */}
            <path
              d="M 68 142 L 92 142 L 90 149 L 70 149 Z"
              fill="#111A2C"
            />
            {/* Clean Tailored Over-shirt (Deep Charcoal / Slate) */}
            <path
              d="M 66 88 L 94 88 L 93 144 L 67 144 Z"
              fill="#2A313B"
              stroke="#333B46"
              strokeWidth="1.2"
            />
            {/* Shirt Center Placket & Subtle Buttons */}
            <line x1="80" y1="88" x2="80" y2="144" stroke="#333B46" strokeWidth="1.5" />
            <circle cx="80" cy="102" r="1" fill="#4A5361" />
            <circle cx="80" cy="118" r="1" fill="#4A5361" />
            <circle cx="80" cy="134" r="1" fill="#4A5361" />

            {/* Minimal Collar */}
            <path d="M 72 88 L 80 96 L 88 88" stroke="#111A2C" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* ==================== HEAD & FACE ==================== */}
          <g id="head" className="transition-transform duration-200">
            {/* Neck */}
            <rect x="76" y="78" width="8" height="12" rx="2" fill="#E8CBB3" />

            {/* Head Silhouette (Warm Asian Skin Tone, mature oval) */}
            <path
              d="M 68 56 C 68 44 92 44 92 56 C 92 70 88 80 80 80 C 72 80 68 70 68 56 Z"
              fill="#EFCFBA"
              stroke="#E0BC9F"
              strokeWidth="1"
            />

            {/* Ears */}
            <ellipse cx="67.5" cy="62" rx="2.5" ry="4" fill="#E8C3A8" />
            <ellipse cx="92.5" cy="62" rx="2.5" ry="4" fill="#E8C3A8" />

            {/* Dark Refined Hair (Short, modern, textured styling) */}
            <path
              d="M 66 54 C 66 38 78 34 88 36 C 94 38 95 44 95 50 C 92 46 87 46 80 47 C 73 48 69 51 66 54 Z"
              fill="#0E1626"
            />
            {/* Sideburns */}
            <rect x="67" y="52" width="2.5" height="7" rx="1" fill="#0E1626" />
            <rect x="90.5" y="52" width="2.5" height="7" rx="1" fill="#0E1626" />

            {/* Minimalist Round-Frame Glasses (Signature PM trait) */}
            <circle cx="75" cy="59" r="4.2" fill="none" stroke="#1E2C45" strokeWidth="1.3" />
            <circle cx="85" cy="59" r="4.2" fill="none" stroke="#1E2C45" strokeWidth="1.3" />
            <line x1="79.2" y1="59" x2="80.8" y2="59" stroke="#1E2C45" strokeWidth="1.3" />
            {/* Glasses temples */}
            <line x1="70.8" y1="58.5" x2="68" y2="57.5" stroke="#1E2C45" strokeWidth="1.1" />
            <line x1="89.2" y1="58.5" x2="92" y2="57.5" stroke="#1E2C45" strokeWidth="1.1" />

            {/* Intelligent eyes inside glasses */}
            <ellipse
              cx={action === 'look-left' ? "73.8" : action === 'look-right' ? "76.2" : "75"}
              cy="59"
              rx="1.1"
              ry="1.2"
              fill="#132038"
            />
            <ellipse
              cx={action === 'look-left' ? "83.8" : action === 'look-right' ? "86.2" : "85"}
              cy="59"
              rx="1.1"
              ry="1.2"
              fill="#132038"
            />

            {/* Gentle, thoughtful smile */}
            <path
              d="M 78 69 C 79 70.2 81 70.2 82 69"
              stroke="#A87558"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* ==================== ARMS & ACCESSORIES ==================== */}
          {/* SITTING AT DESK (Typing hands) */}
          {isSitting ? (
            <g id="sitting-arms">
              {/* Forearm reaching to keyboard */}
              <path
                d="M 72 96 L 56 128 L 48 142 L 36 142"
                stroke="#2A313B"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Typing hands (gentle key tapping animation) */}
              <circle cx="34" cy="142" r="3.5" fill="#EFCFBA">
                <animate attributeName="cy" values="142;140.5;142" dur="0.3s" repeatCount="indefinite" />
              </circle>
              <circle cx="42" cy="143" r="3" fill="#EFCFBA">
                <animate attributeName="cy" values="143;144.5;143" dur="0.28s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : isSwinging ? (
            /* BADMINTON STROKE / SWING ARM */
            <g id="swing-arm">
              {/* Left balancing arm */}
              <path
                d="M 70 94 L 56 112 L 52 125"
                stroke="#2A313B"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="52" cy="126" r="3" fill="#EFCFBA" />

              {/* Right Racket Arm (Dynamic overhead smash / slice stroke follow-through) */}
              <g className="leo-racket-swing" style={{ transformOrigin: '88px 94px' }}>
                <path
                  d="M 88 94 L 108 72 L 122 55"
                  stroke="#2A313B"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="122" cy="54" r="3.5" fill="#EFCFBA" />

                {/* Badminton Racket (Astrox Navy & Orange Accent) */}
                <g transform="translate(122, 52) rotate(-35)">
                  {/* Grip Handle */}
                  <line x1="0" y1="0" x2="16" y2="-12" stroke="#1A2433" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Shaft */}
                  <line x1="16" y1="-12" x2="42" y2="-32" stroke="#34D378" strokeWidth="2.5" />
                  {/* Racket Head (Isometric Oval Frame) */}
                  <ellipse
                    cx="56"
                    cy="-43"
                    rx="14"
                    ry="20"
                    transform="rotate(38, 56, -43)"
                    fill="none"
                    stroke="#1A2433"
                    strokeWidth="2.2"
                  />
                  {/* String Grid (Subtle) */}
                  <ellipse
                    cx="56"
                    cy="-43"
                    rx="11"
                    ry="17"
                    transform="rotate(38, 56, -43)"
                    fill="#EDF1F7"
                    fillOpacity="0.2"
                    stroke="#DDE3EA"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                </g>
              </g>
            </g>
          ) : (
            /* NORMAL STANDING ARMS */
            <g id="default-arms">
              <g style={{ transformOrigin: '88px 94px' }}>
                <path
                  d="M 88 94 L 94 122 L 96 140"
                  stroke="#333B46"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="96" cy="141" r="3.5" fill="#E0BC9F" />
              </g>

              <g style={{ transformOrigin: '72px 94px' }}>
                <path
                  d="M 72 94 L 68 122 L 67 140"
                  stroke="#2A313B"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="67" cy="141" r="3.5" fill="#EFCFBA" />
              </g>
            </g>
          )}

        </g>
      </svg>
    </div>
  );
};
