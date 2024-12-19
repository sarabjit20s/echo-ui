import React from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  View,
  ViewProps,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Slot } from '@/utils/slot';
import { useControllableState } from '@/hooks/useControllableState';
import { Color } from '@/styles/tokens/colors';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type AccordionVariant = 'soft' | 'ghost';

type AccordionContextProps = {
  disabled?: boolean;
  onValueChange: (value: string) => void | ((value: string[]) => void);
  type: 'single' | 'multiple';
  value: string | string[];
  color: Color;
  variant: AccordionVariant;
};

const AccordionContext = React.createContext<AccordionContextProps | null>(
  null,
);

const useAccordion = () => {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error('useAccordion must be used within a <Accordion />');
  }
  return ctx;
};

type AccordionCommonProps = Omit<ViewProps, 'children'> & {
  asChild?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  color?: Color;
  variant?: AccordionVariant;
};

type AccordionSingleProps = AccordionCommonProps & {
  type?: 'single';
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

type AccordionMultipleProps = AccordionCommonProps & {
  type?: 'multiple';
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

const Accordion = React.forwardRef<
  React.ElementRef<typeof View>,
  AccordionProps
>(
  (
    {
      asChild = false,
      type = 'multiple',
      color = 'neutral',
      variant = 'soft',
      disabled,
      defaultValue = [],
      value: valueProp,
      onValueChange: onValueChangeProp,
      style,
      ...restProps
    }: AccordionProps,
    forwardedRef,
  ) => {
    const { styles } = useStyles(stylesheet);

    const [value, setValue] = useControllableState<string | string[]>({
      defaultValue,
      controlledValue: valueProp,
      onControlledChange: onValueChangeProp as
        | ((value: string | string[]) => void)
        | undefined,
    });

    const Comp = asChild ? Slot : View;

    return (
      <AccordionContext.Provider
        value={{
          disabled,
          onValueChange: setValue,
          type,
          value,
          color,
          variant,
        }}
      >
        <Comp
          ref={forwardedRef}
          style={[styles.accordion, style]}
          {...restProps}
        />
      </AccordionContext.Provider>
    );
  },
);

Accordion.displayName = 'Accordion';

type AccordionItemContextProps = {
  value: string;
  triggerId: string;
  expanded: boolean;
  disabled?: boolean;
};

const AccordionItemContext =
  React.createContext<AccordionItemContextProps | null>(null);

const useAccordionItem = () => {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error('useAccordionItem must be used within a <AccordionItem />');
  }
  return ctx;
};

type AccordionItemProps = ViewProps & {
  asChild?: boolean;
  disabled?: boolean;
  value: string;
};

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof View>,
  AccordionItemProps
>(
  (
    {
      asChild = false,
      disabled: disabledProp,
      value,
      style,
      ...restProps
    }: AccordionItemProps,
    forwardedRef,
  ) => {
    const {
      value: rootValue,
      type,
      disabled: rootDisabled,
      color,
      variant,
    } = useAccordion();
    const { styles } = useStyles(stylesheet, {
      variant,
    });
    // priority: itemProps > rootProps
    const disabled = disabledProp ?? rootDisabled ?? false;

    const rootSingleValue = rootValue as string;
    const rootMultipleValue = rootValue as string[];
    const expanded =
      type === 'single'
        ? rootSingleValue === value
        : rootMultipleValue.includes(value);

    const triggerId = React.useId();

    const Comp = asChild ? Slot : View;

    return (
      <AccordionItemContext.Provider
        value={{ expanded, disabled, triggerId, value }}
      >
        <Comp
          ref={forwardedRef}
          style={[styles.accordionItem(color), style]}
          {...restProps}
        />
      </AccordionItemContext.Provider>
    );
  },
);

AccordionItem.displayName = 'AccordionItem';

type AccordionTriggerProps = Omit<PressableProps, 'nativeId'> & {
  asChild?: boolean;
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  AccordionTriggerProps
>(
  (
    {
      asChild = false,
      children,
      accessibilityState,
      disabled: disabledProp,
      onPress: onPressProp,
      style: styleProp,
      ...restProps
    }: AccordionTriggerProps,
    forwardedRef,
  ) => {
    const {
      type,
      color,
      variant,
      value: rootValue,
      onValueChange,
    } = useAccordion();
    const {
      expanded,
      disabled: itemDisabled,
      triggerId,
      value: itemValue,
    } = useAccordionItem();

    const disabled = itemDisabled ?? disabledProp ?? false;

    const { styles } = useStyles(stylesheet, {
      variant,
    });

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        if (disabled) {
          return;
        }
        if (type === 'single') {
          onValueChange(expanded ? '' : itemValue);
        } else {
          const rootMultipleValue = rootValue as string[];
          onValueChange(
            // @ts-ignore
            expanded
              ? rootMultipleValue.filter((v) => v !== itemValue)
              : [...rootMultipleValue, itemValue],
          );
        }
        onPressProp?.(e);
      },
      [
        disabled,
        type,
        onPressProp,
        onValueChange,
        expanded,
        itemValue,
        rootValue,
      ],
    );

    const style = React.useCallback(
      (state: PressableStateCallbackType) => {
        return [
          styles.accordionTrigger(state.pressed, color),
          typeof styleProp === 'function' ? styleProp(state) : styleProp,
        ];
      },
      [color, styles, styleProp],
    );

    const Comp = asChild ? Slot : Pressable;

    return (
      <View accessibilityRole="header">
        <Comp
          ref={forwardedRef}
          nativeID={triggerId}
          accessibilityRole="button"
          accessibilityState={{
            ...accessibilityState,
            disabled,
            expanded,
          }}
          disabled={disabled}
          onPress={onPress}
          style={style}
          {...restProps}
        >
          {children}
        </Comp>
      </View>
    );
  },
);

AccordionTrigger.displayName = 'AccordionTrigger';

type AccordionContentProps = Omit<ViewProps, 'accessibilityLabelledBy'> & {
  asChild?: boolean;
};

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof View>,
  AccordionContentProps
>(
  (
    {
      asChild = false,
      accessibilityRole = 'summary',
      style,
      ...restProps
    }: AccordionContentProps,
    forwardedRef,
  ) => {
    const { variant } = useAccordion();
    const { triggerId, expanded } = useAccordionItem();

    const { styles } = useStyles(stylesheet, {
      variant,
    });

    const height = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        height: expanded
          ? withTiming(height.value, animConfig)
          : withTiming(0, animConfig),
        overflow: 'hidden',
      };
    });

    const onLayout = React.useCallback(
      (e: LayoutChangeEvent) => {
        height.value = e.nativeEvent.layout.height;
      },
      [height],
    );

    const Comp = asChild ? Slot : View;

    return (
      <Animated.View style={animatedStyle}>
        {expanded && (
          <Animated.View
            entering={FadeIn.duration(animConfig.duration)
              .easing(animConfig.easing)
              .reduceMotion(animConfig.reduceMotion)}
            exiting={FadeOut.duration(animConfig.duration)
              .easing(animConfig.easing)
              .reduceMotion(animConfig.reduceMotion)}
            onLayout={onLayout}
            style={styles.accordionContentContainer}
          >
            <Comp
              ref={forwardedRef}
              accessibilityRole={accessibilityRole}
              accessibilityLabelledBy={triggerId}
              style={[styles.accordionContent, style]}
              {...restProps}
            />
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

AccordionContent.displayName = 'AccordionContent';

export const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
  accordion: {
    borderRadius: radius.md,
    overflow: 'hidden',
    gap: space[8],
  },
  accordionItem: (color: Color) => ({
    borderRadius: radius.md,
    borderCurve: 'continuous',
    variants: {
      variant: {
        soft: {
          backgroundColor: colors[`${color}3`],
        },
        ghost: {
          backgroundColor: colors.transparent,
        },
      },
    },
  }),
  accordionTrigger: (pressed: boolean, color: Color) => ({
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[8],
    padding: space[16],
    borderRadius: radius.md,
    variants: {
      variant: {
        soft: {
          backgroundColor: pressed ? colors[`${color}4`] : colors[`${color}3`],
        },
        ghost: {
          backgroundColor: pressed ? colors[`${color}4`] : colors.transparent,
        },
      },
    },
  }),
  accordionContentContainer: {
    position: 'absolute',
  },
  accordionContent: {
    paddingBottom: space[16],
    paddingHorizontal: space[16],
  },
}));

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  useAccordion,
  useAccordionItem,
};
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
};
