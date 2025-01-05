import * as React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens';

type SeparatorProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    color?: Color;
    colorStep?: ColorStep;
    orientation?: 'horizontal' | 'vertical';
    type?: 'hairline' | 'pixel' | 'cell' | 'section';
  };

const Separator = genericForwardRef(function Separator<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    color = 'neutral',
    colorStep = '6',
    orientation = 'horizontal',
    type = 'cell',
    style,
    ...restProp
  }: SeparatorProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet, {
    type,
  });

  const Comp = as || View;

  return (
    <Comp
      ref={ref}
      style={[styles.separator(color, colorStep, orientation), style]}
      {...restProp}
    />
  );
});

const stylesheet = createStyleSheet(({ colors }, rt) => ({
  separator: (
    color: Color,
    colorStep: ColorStep,
    orientation: SeparatorProps['orientation'],
  ) => {
    const isHorizontal = orientation === 'horizontal';
    return {
      flexShrink: 1,
      backgroundColor: colors[`${color}${colorStep}`],
      variants: {
        type: {
          hairline: {
            width: isHorizontal ? '100%' : rt.hairlineWidth,
            height: isHorizontal ? rt.hairlineWidth : '100%',
          },
          pixel: {
            width: isHorizontal ? '100%' : 1,
            height: isHorizontal ? 1 : '100%',
          },
          cell: {
            width: isHorizontal ? '100%' : 2,
            height: isHorizontal ? 2 : '100%',
          },
          section: {
            width: isHorizontal ? '100%' : 6,
            height: isHorizontal ? 6 : '100%',
          },
        },
      },
    };
  },
}));

export { Separator };
export type { SeparatorProps };
