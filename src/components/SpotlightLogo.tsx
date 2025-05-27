import React from 'react';
interface SpotlightLogoProps {
  className?: string;
}
const SpotlightLogo: React.FC<SpotlightLogoProps> = ({
  className = ""
}) => {
  return <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-whiskey rounded-full opacity-20 animate-pulse"></div>
      <div className="relative flex items-center justify-center w-full h-full bg-whiskey-dark rounded-full text-white font-bold">
        <span className="text-xl">AB</span>
      </div>
    </div>;
};
export default SpotlightLogo;