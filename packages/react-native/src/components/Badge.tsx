import React from 'react';
import { View, ViewProps } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { Text, TextProps } from './Text';
import { Slot } from '@/utils/slot';
import { Color, ColorStep } from '@/styles/tokens/colors';

type BadgeColor = Color;
type BadgeSize = 'sm' | 'md' | 'lg';
type BadgeVariant = 'solid' | 'soft' | 'outline';

type BadgeContextValue = {
  color: BadgeColor;
  colorStep: ColorStep;
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

type BadgeProps = ViewProps & {
  asChild?: boolean;
  color?: BadgeColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  highContrast?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
};

const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
  (
    {
      asChild = false,
      color = 'primary',
      size = 'md',
      variant = 'solid',
      highContrast = false,
      disabled = false,
      iconOnly = false,
      style: styleProp,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });

    const colorStep: ColorStep =
      variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

    const Comp = asChild ? Slot : View;

    return (
      <BadgeContext.Provider
        value={{
          color,
          colorStep,
          size,
          variant,
          highContrast,
          disabled,
          iconOnly,
        }}
      >
        <Comp
          ref={forwardedRef}
          style={[
            styles.badge(color, iconOnly),
            disabled && styles.badgeDisabled,
            styleProp,
          ]}
          {...restProps}
        />
      </BadgeContext.Provider>
    );
  },
);

Badge.displayName = 'Badge';

const textFontSizeMap: Record<
  NonNullable<BadgeProps['size']>,
  TextProps['fontSize']
> = {
  sm: 11,
  md: 12,
  lg: 14,
};

type BadgeTextProps = TextProps;

const BadgeText = React.forwardRef<
  React.ElementRef<typeof Text>,
  BadgeTextProps
>((props, forwardedRef) => {
  const { color, colorStep, size, disabled } = useBadge();

  return (
    <Text
      ref={forwardedRef}
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

BadgeText.displayName = 'BadgeText';

const iconSizeMap: Record<
  NonNullable<BadgeProps['size']>,
  IconProps['size']
> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

type BadgeIconProps = IconProps;

const BadgeIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  BadgeIconProps
>((props, forwardedRef) => {
  const { color, colorStep, size, highContrast, disabled } = useBadge();

  return (
    <Icon
      ref={forwardedRef}
      color={color}
      colorStep={colorStep}
      size={iconSizeMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

BadgeIcon.displayName = 'BadgeIcon';

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
          paddingHorizontal: iconOnly ? 0 : space[6],
        },
        md: {
          width: iconOnly ? 24 : 'auto',
          height: 24,
          gap: space[4],
          paddingHorizontal: iconOnly ? 0 : space[8],
        },
        lg: {
          width: iconOnly ? 28 : 'auto',
          height: 28,
          gap: space[4],
          paddingHorizontal: iconOnly ? 0 : space[10],
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
      },
    },
  }),
  badgeDisabled: {
    backgroundColor: colors.neutral3,
    variants: {
      variant: {
        solid: {},
        soft: {},
        outline: {
          borderWidth: 1,
          borderColor: colors.neutral6,
          backgroundColor: colors.transparent,
        },
      },
    },
  },
}));

export { Badge, BadgeText, BadgeIcon, useBadge };
export type { BadgeProps, BadgeTextProps, BadgeIconProps };
