import React from 'react';

type LogoProps = {
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const sizeMap: Record<NonNullable<LogoProps['size']>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export const Logo = React.forwardRef(
  (
    { color = 'currentColor', size: sizeProp = 'md' }: LogoProps,
    ref: React.Ref<SVGSVGElement>,
  ) => {
    const size = sizeMap[sizeProp];
    const strokeWidth = size / 12;
    const radius = size / 2 - strokeWidth / 2;
    const center = size / 2;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <circle cx={center} cy={center} r={radius / 2} fill={color} />
      </svg>
    );
  },
);

Logo.displayName = 'Logo';
