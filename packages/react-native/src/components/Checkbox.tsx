import * as React from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { useControllableState } from '@/hooks/useControllableState';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens';

type CheckboxColor = Color;
type CheckboxSize = 'sm' | 'md' | 'lg';
type CheckboxVariant = 'solid' | 'soft' | 'outline' | 'ghost';

type CheckboxContextValue = {
  checked: boolean;
  disabled: boolean;
  color: CheckboxColor;
  size: CheckboxSize;
  variant: CheckboxVariant;
  highContrast: boolean;
};

const CheckboxContext = React.createContext<CheckboxContextValue | null>(null);

const useCheckbox = () => {
  const ctx = React.useContext(CheckboxContext);
  if (!ctx) {
    throw new Error('useCheckbox must be used within a <Checkbox />');
  }
  return ctx;
};

type CheckboxProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T> & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    color?: CheckboxColor;
    size?: CheckboxSize;
    variant?: CheckboxVariant;
    highContrast?: boolean;
  };

const Checkbox = genericForwardRef(function Checkbox<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    accessibilityState,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    onPress: onPressProp,
    disabled,
    color = 'primary',
    size = 'md',
    variant = 'solid',
    highContrast = false,
    ...restProps
  }: CheckboxProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const [checked, setChecked] = useControllableState({
    defaultValue: defaultChecked ?? false,
    controlledValue: checkedProp,
    onControlledChange: onCheckedChange,
  });

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      setChecked((prev) => !prev);
      onPressProp?.(e);
    },
    [onPressProp, setChecked],
  );

  const Comp = as || Pressable;

  return (
    <CheckboxContext.Provider
      value={{
        checked,
        disabled: !!disabled,
        color,
        size,
        variant,
        highContrast,
      }}
    >
      <Comp
        ref={ref}
        accessibilityRole="checkbox"
        accessibilityState={{
          ...accessibilityState,
          checked,
          disabled: !!disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        {...restProps}
      />
    </CheckboxContext.Provider>
  );
});

type CheckboxIndicatorProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T>;

const CheckboxIndicator = genericForwardRef(function CheckboxIndicator<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    children: childrenProp,
    style: styleProp,
    ...restProps
  }: CheckboxIndicatorProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { checked, disabled, color, size, variant } = useCheckbox();
  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  const children = childrenProp ?? (
    // default icon
    <CheckboxIcon name="checkmark-sharp" />
  );

  const Comp = as || View;

  return (
    <Comp
      ref={ref}
      style={[
        styles.checkboxIndicator(checked, color),
        disabled && styles.checkboxIndicatorDisabled,
        styleProp,
      ]}
      {...restProps}
    >
      {checked && children}
    </Comp>
  );
});

type CheckboxIconProps = IconProps;

const CheckboxIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  CheckboxIconProps
>(function CheckboxIcon(props: CheckboxIconProps, ref) {
  const { disabled, color, size, variant, highContrast } = useCheckbox();

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Icon
      ref={ref}
      size={size}
      color={color}
      colorStep={colorStep}
      disabled={disabled}
      highContrast={highContrast}
      {...props}
    />
  );
});

const stylesheet = createStyleSheet(({ colors, radius }) => ({
  checkboxIndicator: (checked: boolean, color: Color) => ({
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: radius.xs,
    variants: {
      size: {
        sm: {
          width: 16,
          height: 16,
        },
        md: {
          width: 20,
          height: 20,
        },
        lg: {
          width: 24,
          height: 24,
        },
      },
      variant: {
        solid: {
          borderWidth: 1,
          borderColor: checked ? colors[`${color}9`] : colors.neutral7,
          backgroundColor: checked ? colors[`${color}9`] : colors.transparent,
        },
        outline: {
          borderWidth: 1,
          borderColor: colors[`${color}7`],
          backgroundColor: colors.transparent,
        },
        soft: {
          backgroundColor: colors[`${color}4`],
        },
        ghost: {},
      },
    },
  }),
  checkboxIndicatorDisabled: {
    borderColor: colors.neutral6,
    backgroundColor: colors.neutral3,
    variants: {
      variant: {
        solid: {
          borderWidth: 0,
        },
        outline: {
          borderWidth: 1,
        },
        soft: {
          borderWidth: 0,
        },
        ghost: {
          backgroundColor: colors.transparent,
        },
      },
    },
  },
}));

export { Checkbox, CheckboxIndicator, CheckboxIcon, useCheckbox };
export type { CheckboxProps, CheckboxIndicatorProps, CheckboxIconProps };
