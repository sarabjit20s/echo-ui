import * as React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { Text, TextProps } from './Text';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens/colors';

type BadgeColor = Color;
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'solid' | 'soft' | 'outline' | 'surface';

type BadgeContextValue = {
  color: BadgeColor;
  size: BadgeSize;
  variant: BadgeVariant;
  highContrast: boolean;
  disabled: boolean;
  iconOnly: boolean;
};

const BadgeContext = React.createContext<BadgeContextValue | null>(null);

const useBadge = () => {
  const ctx = React.useContext(BadgeContext);
  if (!ctx) {
    throw new Error('useBadge must be used within a <Badge />');
  }
  return ctx;
};

type BadgeProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    color?: BadgeColor;
    size?: BadgeSize;
    variant?: BadgeVariant;
    highContrast?: boolean;
    disabled?: boolean;
    iconOnly?: boolean;
  };

const Badge = genericForwardRef(function Badge<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    color = 'primary',
    size = 'md',
    variant = 'solid',
    highContrast = false,
    disabled = false,
    iconOnly = false,
    style: styleProp,
    ...restProps
  }: BadgeProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  const Comp = as || View;

  return (
    <BadgeContext.Provider
      value={{
        color,
        size,
        variant,
        highContrast,
        disabled,
        iconOnly,
      }}
    >
      <Comp
        ref={ref}
        style={[
          styles.badge(color, iconOnly),
          disabled && styles.badgeDisabled,
          styleProp,
        ]}
        {...restProps}
      />
    </BadgeContext.Provider>
  );
});

const textFontSizeMap: Record<
  NonNullable<BadgeProps['size']>,
  TextProps['fontSize']
> = {
  sm: 11,
  md: 12,
  lg: 14,
};

type BadgeTextProps<T extends React.ElementType = typeof Text> = TextProps<T>;

const BadgeText = genericForwardRef(function BadgeText<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: BadgeTextProps<T>, ref: React.ForwardedRef<T>) {
  const { color, variant, highContrast, size, disabled } = useBadge();

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Text
      ref={ref}
      color={color}
      colorStep={colorStep}
      fontSize={textFontSizeMap[size]}
      fontFamily="interMedium"
      disabled={disabled}
      inherit
      {...props}
    />
  );
});

const iconSizeMap: Record<
  NonNullable<BadgeProps['size']>,
  IconProps['size']
> = {
  sm: '2xs',
  md: 'xs',
  lg: 'sm',
};

type BadgeIconProps = IconProps;

const BadgeIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  BadgeIconProps
>(function BadgeIcon(props, ref) {
  const { color, size, variant, highContrast, disabled } = useBadge();

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Icon
      ref={ref}
      color={color}
      colorStep={colorStep}
      size={iconSizeMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
  badge: (color: Color, iconOnly: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderCurve: 'continuous',
    variants: {
      size: {
        sm: {
          width: iconOnly ? 20 : 'auto',
          height: 20,
          gap: space[2],
          paddingHorizontal: iconOnly ? 0 : space[8],
        },
        md: {
          width: iconOnly ? 24 : 'auto',
          height: 24,
          gap: space[4],
          paddingHorizontal: iconOnly ? 0 : space[10],
        },
        lg: {
          width: iconOnly ? 28 : 'auto',
          height: 28,
          gap: space[4],
          paddingHorizontal: iconOnly ? 0 : space[12],
        },
      },
      variant: {
        solid: {
          backgroundColor: colors[`${color}9`],
        },
        soft: {
          backgroundColor: colors[`${color}3`],
        },
        outline: {
          borderWidth: 1,
          backgroundColor: colors.transparent,
          borderColor: colors[`${color}7`],
        },
        surface: {
          borderWidth: 1,
          backgroundColor: colors[`${color}3`],
          borderColor: colors[`${color}7`],
        },
      },
    },
  }),
  badgeDisabled: {
    backgroundColor: colors.neutral3,
    borderColor: colors.neutral6,
    variants: {
      variant: {
        solid: {},
        soft: {},
        outline: {
          borderWidth: 1,
          backgroundColor: colors.transparent,
        },
        surface: {
          borderWidth: 1,
        },
      },
    },
  },
}));

export { Badge, BadgeText, BadgeIcon, useBadge };
export type { BadgeProps, BadgeTextProps, BadgeIconProps };
