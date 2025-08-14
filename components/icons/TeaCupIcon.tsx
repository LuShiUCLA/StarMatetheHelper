import React from 'react';

const TeaCupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M10 21h4" />
    <path d="M12 17a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3v12z" />
    <path d="M12 5V2" />
    <path d="M18 10a4 4 0 0 1-4 4h-1" />
    <path d="M6 8h.01" />
    <path d="M7 5h.01" />
  </svg>
);

export default TeaCupIcon;
