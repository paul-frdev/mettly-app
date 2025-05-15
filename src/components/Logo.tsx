'use client';

export default function Logo() {
  return (
    <svg
      width="280"
      height="80"
      viewBox="0 0 280 80"
      xmlns="http://www.w3.org/2000/svg"
      className="w-44 h-auto"
    >
      <style>
        {`
          .text-main { font: bold 30px sans-serif; fill: currentColor; }
          .highlight { font: bold 30px sans-serif; fill: #4f46e5; }
          .slogan { font: 15px sans-serif; fill: #6b7280; }
          .icon { fill: #4f46e5; }
        `}
      </style>

      {/* Calendar Icon */}
      <g className="icon" transform="translate(0, 16)">
        <rect x="0" y="0" width="40" height="40" rx="6" />
        <line x1="0" y1="12" x2="40" y2="12" stroke="#fff" strokeWidth="2" />
        <circle cx="12" cy="22" r="2" fill="#fff" />
        <circle cx="20" cy="22" r="2" fill="#fff" />
        <circle cx="28" cy="22" r="2" fill="#fff" />
        <circle cx="12" cy="30" r="2" fill="#fff" />
        <circle cx="20" cy="30" r="2" fill="#fff" />
        <circle cx="28" cy="30" r="2" fill="#fff" />
      </g>

      {/* Main Text */}
      <text x="50" y="40" className="text-main">Meet</text>
      <text x="125" y="40" className="highlight">LY</text>

      {/* Slogan */}
      <text x="50" y="60" className="slogan">Simple CRM for People</text>
    </svg>
  );
}
