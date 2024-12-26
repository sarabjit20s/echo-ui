import * as React from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { useControllableState } from '@/hooks/useControllableState';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens/colors';

type RadioGroupColor = Color;
type RadioGroupSize = 'sm' | 'md' | 'lg';
type RadioGroupVariant = 'solid' | 'soft' | 'outline' | 'ghost';

type RadioGroupContextValue = {
  color: RadioGroupColor;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  size: RadioGroupSize;
  value: string;
  variant: RadioGroupVariant;
  highContrast: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
);

const useRadioGroup = () => {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('useRadioGroup must be used within a <RadioGroup />');
  }
  return ctx;
};

type RadioGroupProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    color?: RadioGroupColor;
    size?: RadioGroupSize;
    variant?: RadioGroupVariant;
    highContrast?: boolean;
  };

const RadioGroup = genericForwardRef(function RadioGroup<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    defaultValue,
    value: valueProp,
    onValueChange: onValueChangeProp,
    disabled,
    color = 'primary',
    size = 'md',
    variant = 'solid',
    highContrast = false,
    ...restProps
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const [value, onValueChange] = useControllableState({
    defaultValue: defaultValue ?? '',
    controlledValue: valueProp,
    onControlledChange: onValueChangeProp,
  });

  const Comp = as || View;

  return (
    <RadioGroupContext.Provider
      value={{
        color,
        disabled,
        onValueChange,
        size,
        value,
        variant,
        highContrast,
      }}
    >
      <Comp ref={ref} accessibilityRole="radiogroup" {...restProps} />
    </RadioGroupContext.Provider>
  );
});

type RadioGroupItemContextValue = {
  checked: boolean;
  disabled: boolean;
};

const RadioGroupItemContext =
  React.createContext<RadioGroupItemContextValue | null>(null);

const useRadioGroupItem = () => {
  const context = React.useContext(RadioGroupItemContext);
  if (!context) {
    throw new Error(
      'useRadioGroupItem must be used within a <RadioGroupItem />',
    );
  }
  return context;
};

type RadioGroupItemProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T> & {
    value: string;
  };

const RadioGroupItem = genericForwardRef(function RadioGroupItem<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    accessibilityState,
    value,
    disabled: disabledProp,
    onPress: onPressProp,
    ...restProps
  }: RadioGroupItemProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const ctx = useRadioGroup();

  const checked = ctx.value === value;
  const disabled = disabledProp ?? ctx?.disabled;

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      ctx?.onValueChange?.(value);
      onPressProp?.(e);
    },
    [ctx, onPressProp, value],
  );

  const Comp = as || Pressable;

  return (
    <RadioGroupItemContext.Provider value={{ checked, disabled: !!disabled }}>
      <Comp
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={onPress}
        {...restProps}
      />
    </RadioGroupItemContext.Provider>
  );
});

type RadioGroupIndicatorProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T>;

const RadioGroupIndicator = genericForwardRef(function RadioGroupIndicator<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    children: childrenProp,
    style,
    ...restProps
  }: RadioGroupIndicatorProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { color, size, variant, highContrast } = useRadioGroup();
  const { checked, disabled } = useRadioGroupItem();

  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  const colorStep: ColorStep =
    variant === 'solid' ? 'Contrast' : highContrast ? '12' : '11';

  const children = childrenProp ?? (
    // default indicator
    <View
      style={[
        styles.innerCircle(color, colorStep),
        disabled && styles.innerCircleDisabled,
      ]}
    />
  );

  const Comp = as || View;

  return (
    <Comp
      ref={ref}
      style={[
        styles.outerCircle(checked, color),
        disabled && styles.outerCircleDisabled,
        style,
      ]}
      {...restProps}
    >
      {checked && children}
    </Comp>
  );
});

const stylesheet = createStyleSheet(({ colors, radius }) => ({
  outerCircle: (checked: boolean, color: Color) => ({
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
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
  innerCircle: (color: Color, colorStep: ColorStep) => ({
    borderRadius: radius.full,
    variants: {
      size: {
        sm: {
          width: getInnerCircleSize(16),
          height: getInnerCircleSize(16),
        },
        md: {
          width: getInnerCircleSize(20),
          height: getInnerCircleSize(20),
        },
        lg: {
          width: getInnerCircleSize(24),
          height: getInnerCircleSize(24),
        },
      },
      variant: {
        ghost: {
          backgroundColor: colors[`${color}${colorStep}`],
        },
        outline: {
          backgroundColor: colors[`${color}${colorStep}`],
        },
        soft: {
          backgroundColor: colors[`${color}${colorStep}`],
        },
        solid: {
          backgroundColor: colors[`${color}${colorStep}`],
        },
      },
    },
  }),
  outerCircleDisabled: {
    borderColor: colors.neutral6,
    backgroundColor: colors.neutral3,
    variants: {
      variant: {
        ghost: {
          backgroundColor: colors.transparent,
        },
      },
    },
  },
  innerCircleDisabled: {
    backgroundColor: colors.neutral8,
  },
}));

function getInnerCircleSize(size: number) {
  return Math.floor(size / 2.5);
}

export {
  RadioGroup,
  RadioGroupItem,
  RadioGroupIndicator,
  useRadioGroup,
  useRadioGroupItem,
};
export type { RadioGroupProps, RadioGroupItemProps, RadioGroupIndicatorProps };
