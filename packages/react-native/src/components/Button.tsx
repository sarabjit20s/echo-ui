import React from 'react';
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { Text, TextProps } from './Text';
import { Slot } from '@/utils/slot';
import { Color, ColorStep } from '@/styles/tokens/colors';

type ButtonColor = Color;
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text';

type ButtonContextValue = {
  color: ButtonColor;
  colorStep: ColorStep;
  size: ButtonSize;
  variant: ButtonVariant;
  highContrast: boolean;
  disabled: boolean;
  iconOnly: boolean;
};

const ButtonContext = React.createContext<ButtonContextValue | null>(null);

const useButton = () => {
  const ctx = React.useContext(ButtonContext);
  if (!ctx) {
    throw new Error('useButton must be used within a <Button />');
  }
  return ctx;
};

type ButtonProps = PressableProps & {
  asChild?: boolean;
  color?: ButtonColor;
  size?: ButtonSize;
  variant?: ButtonVariant;
  highContrast?: boolean;
  fill?: boolean;
  iconOnly?: boolean;
};

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      asChild = false,
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
    }: ButtonProps,
    forwardedRef,
  ) => {
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
      fill,
    });

    const disabled = disabledProp ?? false;
    const colorStep: ColorStep =
      variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

    const style = React.useCallback(
      (state: PressableStateCallbackType): any => {
        return [
          styles.button(color, state.pressed, iconOnly),
          disabled && styles.disabledButton,
          typeof styleProp === 'function' ? styleProp(state) : styleProp,
        ];
      },
      [color, disabled, iconOnly, styles, styleProp],
    );

    const Comp = asChild ? Slot : Pressable;

    return (
      <ButtonContext.Provider
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
          accessibilityRole="button"
          accessibilityState={{
            ...accessibilityState,
            disabled,
          }}
          disabled={disabled}
          style={style}
          {...restProps}
        />
      </ButtonContext.Provider>
    );
  },
);

Button.displayName = 'Button';

const buttonTextVariantMap: Record<
  NonNullable<ButtonProps['size']>,
  TextProps['variant']
> = {
  xs: 'labelXs',
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelLg',
};

type ButtonTextProps = TextProps;

const ButtonText = React.forwardRef<
  React.ElementRef<typeof Text>,
  ButtonTextProps
>((props: ButtonTextProps, forwardedRef) => {
  const { color, colorStep, size, highContrast, disabled } = useButton();
  return (
    <Text
      ref={forwardedRef}
      color={color}
      colorStep={colorStep}
      variant={buttonTextVariantMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

ButtonText.displayName = 'ButtonText';

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
>((props: ButtonIconProps, forwardedRef) => {
  const { color, colorStep, size, highContrast, disabled, iconOnly } =
    useButton();
  return (
    <Icon
      ref={forwardedRef}
      color={color}
      colorStep={colorStep}
      size={iconOnly ? iconOnlySizeMap[size] : iconSizeMap[size]}
      highContrast={highContrast}
      disabled={disabled}
      {...props}
    />
  );
});

ButtonIcon.displayName = 'ButtonIcon';

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
        text: {
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
        text: {
          backgroundColor: colors.transparent,
        },
      },
    },
  },
}));

export { Button, ButtonText, ButtonIcon, useButton };
export type { ButtonProps, ButtonTextProps, ButtonIconProps };
