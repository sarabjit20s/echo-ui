import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useStyles } from 'react-native-unistyles';

import { Color, ColorStep } from '@/styles/tokens/colors';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

type SpinnerProps = {
  color?: Color;
  colorStep?: ColorStep;
  highContrast?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const spinnerSizeMap: Record<NonNullable<SpinnerProps['size']>, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 36,
};

const Spinner = React.forwardRef<React.ElementRef<typeof Svg>, SpinnerProps>(
  ({ loading = true, ...restProps }: SpinnerProps, forwardedRef) => {
    if (!loading) {
      return null;
    }
    return <SpinnerImpl ref={forwardedRef} {...restProps} />;
  },
);

Spinner.displayName = 'Spinner';

type SpinnerImplProps = Omit<SpinnerProps, 'loading'>;

const SpinnerImpl = React.forwardRef<
  React.ElementRef<typeof Svg>,
  SpinnerImplProps
>(
  (
    {
      color: colorProp = 'neutral',
      colorStep,
      highContrast = false,
      size: sizeProp = 'md',
      style,
    }: SpinnerProps,
    forwardedRef,
  ) => {
    const { theme } = useStyles();

    const color =
      theme.colors[`${colorProp}${colorStep ?? (highContrast ? 12 : 11)}`];

    const size = spinnerSizeMap[sizeProp];
    const strokeWidth = size / 12;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    const rotation = useSharedValue(0);

    React.useEffect(() => {
      rotation.value = withRepeat(
        withTiming(360, { duration: 600, easing: Easing.linear }),
        -1,
      );
    }, [rotation]);

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <AnimatedSvg
        ref={forwardedRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={[animatedStyles, style]}
      >
        <Circle
          r={radius}
          cx={center}
          cy={center}
          fill={theme.colors.transparent}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference / 1.5} ${circumference}`} // Single dash
          strokeLinecap="round"
        />
      </AnimatedSvg>
    );
  },
);

SpinnerImpl.displayName = 'SpinnerImpl';

export { Spinner };
export type { SpinnerProps };
