'use client';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      width="280"
      height="80"
      viewBox="0 0 280 80"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-44 h-auto ${className}`}
    >
      <style>
        {`
          .text-main { font: bold 30px sans-serif; fill: currentColor; }
          .highlight { font: bold 30px sans-serif; fill: #e42627; }
          .slogan { font: 15px sans-serif; fill: #9ca3af; }
          .icon { fill: #e42627; }
        `}
      </style>

      {/* Calendar Icon */}
      <g className="icon" transform="translate(0, 16)">
        <rect x="0" y="0" width="40" height="40" rx="6" />
        <line x1="0" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="22" r="2" fill="currentColor" />
        <circle cx="20" cy="22" r="2" fill="currentColor" />
        <circle cx="28" cy="22" r="2" fill="currentColor" />
        <circle cx="12" cy="30" r="2" fill="currentColor" />
        <circle cx="20" cy="30" r="2" fill="currentColor" />
        <circle cx="28" cy="30" r="2" fill="currentColor" />
      </g>

      {/* Main Text */}
      <text x="50" y="40" className="text-main">Meet</text>
      <text x="125" y="40" className="highlight">LY</text>

      {/* Slogan */}
      <text x="50" y="60" className="slogan">Simple CRM for People</text>
    </svg>
  );
}
