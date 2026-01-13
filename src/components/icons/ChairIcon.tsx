import React, { forwardRef, SVGProps } from 'react';

interface ChairIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const ChairIcon = forwardRef<SVGSVGElement, ChairIconProps>(
  ({ className, filled = false, ...props }, ref) => {
    return (
      <svg 
        ref={ref}
        viewBox="0 0 24 24" 
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* Seat back */}
        <path 
          d="M6 4C6 3 7 2 8 2H16C17 2 18 3 18 4V12C18 13 17 14 16 14H8C7 14 6 13 6 12V4Z"
          className={filled ? "fill-primary" : "fill-muted"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Seat cushion */}
        <path 
          d="M5 14H19C20 14 21 15 21 16V17C21 18 20 19 19 19H5C4 19 3 18 3 17V16C3 15 4 14 5 14Z"
          className={filled ? "fill-primary" : "fill-muted"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Legs */}
        <path 
          d="M6 19V22M18 19V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
);

ChairIcon.displayName = 'ChairIcon';
