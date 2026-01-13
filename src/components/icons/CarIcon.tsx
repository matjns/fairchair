import React from 'react';

interface CarIconProps {
  className?: string;
}

export const CarIcon: React.FC<CarIconProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 50" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Car body */}
      <path 
        d="M10 35 L15 20 Q20 15 35 15 L65 15 Q80 15 85 20 L90 35 L90 40 L10 40 L10 35Z" 
        className="fill-primary"
      />
      {/* Windows */}
      <path 
        d="M20 33 L25 22 Q28 18 38 18 L48 18 L48 33 L20 33Z" 
        className="fill-primary-foreground/80"
      />
      <path 
        d="M52 33 L52 18 L62 18 Q72 18 75 22 L80 33 L52 33Z" 
        className="fill-primary-foreground/80"
      />
      {/* Roof */}
      <path 
        d="M25 15 Q30 8 50 8 Q70 8 75 15" 
        stroke="currentColor" 
        strokeWidth="0"
        className="fill-primary"
      />
      {/* Wheels */}
      <circle cx="25" cy="42" r="8" className="fill-foreground" />
      <circle cx="25" cy="42" r="4" className="fill-muted" />
      <circle cx="75" cy="42" r="8" className="fill-foreground" />
      <circle cx="75" cy="42" r="4" className="fill-muted" />
      {/* Headlights */}
      <ellipse cx="88" cy="32" rx="3" ry="2" className="fill-warning" />
      <ellipse cx="12" cy="32" rx="3" ry="2" className="fill-destructive/60" />
    </svg>
  );
};
