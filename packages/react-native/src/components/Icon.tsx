import React from 'react';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Color, ColorStep } from '@/styles/tokens/colors';

type IconProps = Omit<
  React.ComponentProps<typeof Ionicons>,
  'color' | 'size'
> & {
  color?: Color;
  colorStep?: ColorStep;
  highContrast?: boolean;
  size?:
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl';
};

const Icon = React.forwardRef<React.ElementRef<typeof Ionicons>, IconProps>(
  (
    {
      name,
      color = 'neutral',
      colorStep: colorStepProp,
      highContrast = false,
      size = 'md',
      disabled,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { styles, theme } = useStyles(stylesheet, {
      size,
    });

    const colorStep: ColorStep = colorStepProp ?? (highContrast ? '12' : '11');

    const iconColor = disabled
      ? theme.colors.neutral8
      : theme.colors[`${color}${colorStep}`];

    return (
      <Ionicons
        ref={forwardedRef}
        name={name}
        color={iconColor}
        disabled={disabled}
        style={[styles.icon, style]}
        {...restProps}
      />
    );
  },
);

Icon.displayName = 'Icon';

const stylesheet = createStyleSheet(({ space }) => ({
  icon: {
    variants: {
      size: {
        xs: {
          fontSize: space[12],
        },
        sm: {
          fontSize: space[14],
        },
        md: {
          fontSize: space[16],
        },
        lg: {
          fontSize: space[18],
        },
        xl: {
          fontSize: space[20],
        },
        '2xl': {
          fontSize: space[24],
        },
        '3xl': {
          fontSize: space[28],
        },
        '4xl': {
          fontSize: space[32],
        },
        '5xl': {
          fontSize: space[36],
        },
        '6xl': {
          fontSize: space[40],
        },
      },
    },
  },
}));

export { Icon };
export type { IconProps };
