import React, { useState, useRef } from 'react';

interface CargasLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onAdminPasscodeTrigger?: () => void;
  className?: string;
}

export const CargasLogo: React.FC<CargasLogoProps> = ({
  size = 'md',
  showText = true,
  onAdminPasscodeTrigger,
  className = '',
}) => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    if (nextCount >= 5) {
      setClickCount(0);
      if (onAdminPasscodeTrigger) {
        onAdminPasscodeTrigger();
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1500);
    }
  };

  const dimensions = {
    sm: { w: 36, h: 36, textSize: 'text-sm', subSize: 'text-[9px]' },
    md: { w: 48, h: 48, textSize: 'text-lg', subSize: 'text-[11px]' },
    lg: { w: 68, h: 68, textSize: 'text-2xl', subSize: 'text-xs' },
    xl: { w: 96, h: 96, textSize: 'text-3xl', subSize: 'text-sm' },
  }[size];

  return (
    <div
      onClick={handleLogoClick}
      title="انقر 5 مرات للوصول السريع لمدير النظام"
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
    >
      {/* Emblem SVG reproduction of Green Energy Nozzle Emblem with NGV */}
      <div
        className="relative flex-shrink-0 rounded-2xl flex items-center justify-center p-1 transition-shadow duration-300"
        style={{ width: dimensions.w, height: dimensions.h }}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Green Leaf Silhouette */}
          <path
            d="M250 20 C270 70 330 110 395 160 C440 195 460 250 440 310 C410 400 320 445 250 445 C180 445 90 400 60 310 C40 250 60 195 105 160 C170 110 230 70 250 20 Z"
            fill="#117A38"
          />

          {/* Yellow Natural Gas Energy Flame inside Leaf */}
          <path
            d="M250 115 C265 145 295 175 285 210 C275 245 245 260 235 245 C225 230 235 210 240 195 C245 175 235 160 220 185 C210 202 212 225 218 245 C222 260 215 280 198 275 C180 270 182 245 190 225 C205 185 235 145 250 115 Z"
            fill="#FFC72C"
          />

          {/* CNG Fuel Nozzle Outline & Body */}
          <g transform="translate(110, 120) scale(0.6)">
            {/* Nozzle spout & hose */}
            <path
              d="M330 30 L400 3 C405 1 412 5 410 12 L395 35 L335 55 Z"
              fill="#FFFFFF"
            />
            {/* Long curved nozzle spout */}
            <path
              d="M175 140 C215 100 270 65 340 50 L345 35 C270 50 210 85 165 130 Z"
              fill="#FFFFFF"
            />
            {/* Main Dispenser Nozzle Handle Body */}
            <path
              d="M165 130 C155 125 140 130 135 142 L95 230 C90 240 95 255 108 260 L145 275 C158 280 172 272 176 260 L215 170 C220 158 212 145 200 140 Z"
              fill="#FFFFFF"
            />
            {/* Handle inner trigger opening */}
            <path
              d="M142 165 C138 175 130 195 125 205 C122 212 125 218 132 222 L150 228 C158 232 164 228 167 220 L178 195 C182 188 178 180 172 176 Z"
              fill="#117A38"
            />
            {/* Lever Trigger */}
            <path
              d="M150 185 C145 205 140 225 142 235 C143 240 148 242 153 238 C158 233 162 215 165 195 Z"
              fill="#FFC72C"
            />
            {/* Flexible fuel hose connector */}
            <path
              d="M102 255 C85 290 65 320 60 365 C58 380 50 395 35 400 L25 385 C40 375 48 360 50 345 C55 310 75 275 92 245 Z"
              fill="#117A38"
              stroke="#FFFFFF"
              strokeWidth="6"
            />
          </g>

          {/* Yellow "NGV" Typography at Base */}
          <text
            x="250"
            y="470"
            textAnchor="middle"
            fill="#FFC72C"
            fontWeight="900"
            fontSize="108"
            fontFamily="'Cairo', 'Arial Black', sans-serif"
            fontStyle="italic"
            letterSpacing="8"
          >
            NGV
          </text>
        </svg>

        {/* Secret tap indicator badge when tapping */}
        {clickCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow">
            {5 - clickCount}
          </span>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-emerald-800 dark:text-emerald-400 font-sans ${dimensions.textSize}`}>
              CARGAS
            </span>
            <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-1.5 py-0.5 rounded uppercase">
              NGV
            </span>
          </div>
          <span className={`text-slate-500 dark:text-slate-400 font-medium leading-none ${dimensions.subSize}`}>
            كارجاس للغاز الطبيعي والولاء
          </span>
        </div>
      )}
    </div>
  );
};
