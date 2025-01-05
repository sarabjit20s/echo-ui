import * as React from 'react';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { Text, TextProps } from './Text';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens';

type ButtonColor = Color;
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'plain';

type ButtonContextValue = {
  color: ButtonColor;
  size: ButtonSize;
  variant: ButtonVariant;
  highContrast: boolean;
  disabled: boolean;
  iconOnly: boolean;
};

const ButtonContext = React.createContext<ButtonContextValue | null>(null);

ButtonContext.displayName = 'ButtonContext';

const useButton = () => {
  const ctx = React.useContext(ButtonContext);
  if (!ctx) {
    throw new Error('useButton must be used within a <Button />');
  }
  return ctx;
};

type ButtonProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T> & {
    color?: ButtonColor;
    size?: ButtonSize;
    variant?: ButtonVariant;
    highContrast?: boolean;
    fill?: boolean;
    iconOnly?: boolean;
  };

const Button = genericForwardRef(function Button<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    accessibilityState,
    color = 'primary',
    size = 'md',
    variant = 'solid',
    disabled: disabledProp,
    fill = false,
    highContrast = false,
    iconOnly = false,
    style: styleProp,
    ...restProps
  }: ButtonProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet, {
    size,
    variant,
    fill,
  });

  const disabled = disabledProp ?? false;

  const Comp = as || Pressable;

  return (
    <ButtonContext.Provider
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
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          ...accessibilityState,
        }}
        disabled={disabled}
        style={(state) => [
          styles.button(color, state.pressed, iconOnly),
          disabled && styles.disabledButton,
          typeof styleProp === 'function' ? styleProp(state) : styleProp,
        ]}
        {...restProps}
      />
    </ButtonContext.Provider>
  );
});

const textVariantMap: Record<
  NonNullable<ButtonProps['size']>,
  TextProps['variant']
> = {
  xs: 'labelXs',
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelLg',
};

type ButtonTextProps<T extends React.ElementType = typeof Text> = TextProps<T>;

const ButtonText = genericForwardRef(function ButtonText<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: ButtonTextProps<T>, ref: React.ForwardedRef<T>) {
  const { color, size, variant, highContrast, disabled } = useButton();

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Text
      ref={ref}
      color={color}
      colorStep={colorStep}
      variant={textVariantMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

const iconSizeMap: Record<
  NonNullable<ButtonProps['size']>,
  IconProps['size']
> = {
  xs: 'sm',
  sm: 'md',
  md: 'lg',
  lg: 'xl',
};
const iconOnlySizeMap: Record<
  NonNullable<ButtonProps['size']>,
  IconProps['size']
> = {
  xs: 'md',
  sm: 'lg',
  md: 'xl',
  lg: '2xl',
};

type ButtonIconProps = IconProps;

const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  ButtonIconProps
>(function ButtonIcon(props: ButtonIconProps, ref) {
  const { color, size, variant, highContrast, disabled, iconOnly } =
    useButton();

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Icon
      ref={ref}
      color={color}
      colorStep={colorStep}
      size={iconOnly ? iconOnlySizeMap[size] : iconSizeMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
  button: (color: Color, pressed: boolean, iconOnly: boolean) => ({
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    borderCurve: 'continuous',
    variants: {
      size: {
        xs: {
          width: iconOnly ? 28 : 'auto',
          height: 28,
          paddingHorizontal: iconOnly ? 0 : space[8],
          gap: space[4],
        },
        sm: {
          width: iconOnly ? 36 : 'auto',
          height: 36,
          paddingHorizontal: iconOnly ? 0 : space[12],
          gap: space[6],
        },
        md: {
          width: iconOnly ? 44 : 'auto',
          height: 44,
          paddingHorizontal: iconOnly ? 0 : space[16],
          gap: space[8],
        },
        lg: {
          width: iconOnly ? 52 : 'auto',
          height: 52,
          paddingHorizontal: iconOnly ? 0 : space[20],
          gap: space[12],
        },
      },
      variant: {
        solid: {
          backgroundColor: pressed ? colors[`${color}10`] : colors[`${color}9`],
        },
        soft: {
          backgroundColor: pressed ? colors[`${color}4`] : colors[`${color}3`],
        },
        outline: {
          borderWidth: 1,
          backgroundColor: pressed ? colors[`${color}3`] : colors.transparent,
          borderColor: pressed ? colors[`${color}8`] : colors[`${color}7`],
        },
        ghost: {
          backgroundColor: pressed ? colors[`${color}3`] : colors.transparent,
        },
        plain: {
          opacity: pressed ? 0.5 : 1,
          backgroundColor: colors.transparent,
        },
      },
      fill: {
        true: {
          width: '100%',
          flexShrink: 1,
        },
        false: {},
      },
    },
  }),
  disabledButton: {
    borderColor: colors.neutral6,
    variants: {
      variant: {
        solid: {
          backgroundColor: colors.neutral3,
        },
        soft: {
          backgroundColor: colors.neutral3,
        },
        outline: {
          borderWidth: 1,
          backgroundColor: colors.transparent,
        },
        ghost: {
          backgroundColor: colors.transparent,
        },
        plain: {
          backgroundColor: colors.transparent,
        },
      },
    },
  },
}));

export { Button, ButtonText, ButtonIcon, useButton };
export type { ButtonProps, ButtonTextProps, ButtonIconProps };
