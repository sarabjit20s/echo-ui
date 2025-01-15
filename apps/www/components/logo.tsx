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

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 36 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.0246 4.83292C21.5633 6.23056 22.143 8.40844 21.5046 10.3938L20.1993 14.4533C19.4231 16.8674 18.8417 17.0582 16.8018 15.5688L13.3829 13.0723C11.7074 11.8489 10.9009 9.74893 11.3228 7.70844L12.4148 2.42676C12.9985 -0.396182 13.9299 -0.702745 16.0561 1.22842L20.0246 4.83292ZM35.4134 9.92803C36.5801 7.29476 36.0027 6.49731 33.1566 6.81061L27.8315 7.39677C25.7742 7.62322 24.0405 9.04464 23.4029 11.0276L22.1019 15.0738C21.3257 17.4878 21.6856 17.9837 24.2052 17.9812H28.442C30.5141 17.9791 32.3916 16.7488 33.236 14.843L35.4134 9.92803ZM33.1799 31.1575C36.0271 31.4612 36.6017 30.6618 35.4264 28.0325L33.2273 23.1131C32.3778 21.2125 30.4997 19.9911 28.4301 19.9932L24.2071 19.9974C21.6876 19.9999 21.3286 20.4985 22.1096 22.9111L23.4228 26.9679C24.0651 28.952 25.8051 30.3708 27.8657 30.5906L33.1799 31.1575ZM12.4422 35.5784C13.0352 38.3994 13.9677 38.7028 16.0874 36.7645L20.0534 33.138C21.5856 31.7369 22.1586 29.5606 21.5172 27.579L20.2083 23.5353C19.4273 21.1228 18.8455 20.933 16.8086 22.4266L13.3834 24.938C11.7082 26.1664 10.9061 28.2714 11.3353 30.3131L12.4422 35.5784ZM1.85905 17.0812C-0.621569 18.521 -0.619926 19.5079 1.86544 20.9393L6.51566 23.6173C8.31217 24.652 10.5444 24.5284 12.2175 23.3016L15.6315 20.7983C17.6684 19.3048 17.6678 18.6888 15.628 17.1994L12.1979 14.6947C10.5203 13.4697 8.28454 13.3519 6.4892 14.3939L1.85905 17.0812Z"
          fill={color}
        />
      </svg>
    );
  },
);

Logo.displayName = 'Logo';
