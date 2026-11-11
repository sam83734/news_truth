import React from 'react';

interface SusaLabsLogoProps {
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export const SusaLabsLogo: React.FC<SusaLabsLogoProps> = ({
  className = '',
  size = 46,
  showSubtitle = true,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer ${className}`}>
      {/* Authentic SusaLabs Brand Identity (Transparent PNG) */}
      <img
        src="/susalabs-logo.png"
        alt="SusaLabs"
        style={{ height: `${size}px` }}
        className="w-auto object-contain"
      />

      {showSubtitle && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-widest leading-none">
              DLT Truth
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-0.5 leading-tight">
            NextTruth Ground Dispatch
          </span>
        </div>
      )}
    </div>
  );
};
