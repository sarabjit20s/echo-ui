import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  View,
  ViewProps,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Icon, IconProps } from './Icon';
import { Slot } from '@/utils/slot';
import { useControllableState } from '@/hooks/useControllableState';
import { Color, ColorStep } from '@/styles/tokens/colors';

type CheckboxContextValue = {
  checked: boolean;
  disabled: boolean;
  color: Color;
  size: 'sm' | 'md' | 'lg';
  variant: 'solid' | 'soft' | 'outline' | 'ghost';
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

type CheckboxProps = PressableProps & {
  asChild?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  color?: Color;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  highContrast?: boolean;
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  CheckboxProps
>(
  (
    {
      asChild = false,
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
    }: CheckboxProps,
    forwardedRef,
  ) => {
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

    const Comp = asChild ? Slot : Pressable;

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
          ref={forwardedRef}
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
  },
);

Checkbox.displayName = 'Checkbox';

type CheckboxIndicatorProps = ViewProps & {
  asChild?: boolean;
};

const CheckboxIndicator = React.forwardRef<
  React.ElementRef<typeof View>,
  ViewProps
>(
  (
    {
      asChild = false,
      children: childrenProp,
      style,
      ...restProps
    }: CheckboxIndicatorProps,
    forwardedRef,
  ) => {
    const { checked, disabled, color, size, variant } = useCheckbox();
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });

    const children = childrenProp ?? (
      // default icon
      <CheckboxIcon name="checkmark-sharp" />
    );

    const Comp = asChild ? Slot : View;

    return (
      <Comp
        ref={forwardedRef}
        style={[
          styles.checkboxIndicator(checked, color),
          disabled && styles.checkboxIndicatorDisabled,
          style,
        ]}
        {...restProps}
      >
        {checked && children}
      </Comp>
    );
  },
);

CheckboxIndicator.displayName = 'CheckboxIndicator';

type CheckboxIconProps = IconProps;

const CheckboxIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  CheckboxIconProps
>((props: CheckboxIconProps, forwardedRef) => {
  const { disabled, color, size, variant, highContrast } = useCheckbox();
  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  return (
    <Icon
      ref={forwardedRef}
      size={size}
      color={color}
      colorStep={colorStep}
      disabled={disabled}
      highContrast={highContrast}
      {...props}
    />
  );
});

CheckboxIcon.displayName = 'CheckboxIcon';

const stylesheet = createStyleSheet(({ colors, radius }) => ({
  checkboxIndicator: (checked: boolean, color: Color) => ({
    justifyContent: 'center',
    alignItems: 'center',
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
        ghost: {},
        outline: {
          borderWidth: 1,
          borderColor: colors[`${color}7`],
          backgroundColor: colors.transparent,
        },
        soft: {
          backgroundColor: colors[`${color}4`],
        },
        solid: {
          borderWidth: 1,
          borderColor: checked ? colors[`${color}9`] : colors.neutral7,
          backgroundColor: checked ? colors[`${color}9`] : colors.transparent,
        },
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
        ghost: {
          backgroundColor: colors.transparent,
        },
      },
    },
  },
}));

export { Checkbox, CheckboxIndicator, CheckboxIcon, useCheckbox };
export type { CheckboxProps, CheckboxIndicatorProps, CheckboxIconProps };
