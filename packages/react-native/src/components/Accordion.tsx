import * as React from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  View,
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

import { useControllableState } from '@/hooks/useControllableState';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color } from '@/styles/tokens';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type AccordionColor = Color;
type AccordionVariant = 'soft';

type AccordionContextValue = {
  type: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  color: AccordionColor;
  variant: AccordionVariant;
  disabled?: boolean;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);

const useAccordion = () => {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) {
    throw new Error('useAccordion must be used within a <Accordion />');
  }
  return ctx;
};

type ItemPosition = 'first' | 'middle' | 'last' | 'single';

type AccordionItemPositionContextValue = ItemPosition;

const AccordionItemPositionContext =
  React.createContext<AccordionItemPositionContextValue | null>(null);

const useAccordionItemPosition = () => {
  const ctx = React.useContext(AccordionItemPositionContext);
  if (!ctx) {
    throw new Error(
      'useAccordionItemPosition must be used within a <AccordionItem />',
    );
  }
  return ctx;
};

type AccordionCommonProps<T extends React.ElementType> = PolymorphicProps<T> & {
  color?: AccordionColor;
  variant?: AccordionVariant;
  disabled?: boolean;
};

type AccordionSingleProps<T extends React.ElementType> =
  AccordionCommonProps<T> & {
    type?: 'single';
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  };

type AccordionMultipleProps<T extends React.ElementType> =
  AccordionCommonProps<T> & {
    type?: 'multiple';
    defaultValue?: string[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
  };

type AccordionProps<T extends React.ElementType = typeof View> =
  | AccordionSingleProps<T>
  | AccordionMultipleProps<T>;

const Accordion = genericForwardRef(function Accordion<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    children,
    type = 'multiple',
    color = 'neutral',
    variant = 'soft',
    disabled,
    defaultValue = [],
    value: valueProp,
    onValueChange: onValueChangeProp,
    style,
    ...restProps
  }: AccordionProps<T>,
  ref: React.ForwardedRef<T>,
) {
  const { styles } = useStyles(stylesheet);

  const [value, setValue] = useControllableState<string | string[]>({
    defaultValue,
    controlledValue: valueProp,
    onControlledChange: onValueChangeProp as
      | ((value: string | string[]) => void)
      | undefined,
  });

  const childrenArr = Array.isArray(children) ? children : [children];

  const Comp = as || View;

  return (
    <AccordionContext.Provider
      value={{
        disabled,
        type,
        value,
        color,
        variant,
        onValueChange: setValue,
      }}
    >
      <Comp ref={ref} style={[styles.accordion, style]} {...restProps}>
        {childrenArr.map((child, i) => {
          return (
            <AccordionItemPositionContext.Provider
              key={i}
              value={
                childrenArr.length === 1
                  ? 'single'
                  : i === 0
                    ? 'first'
                    : i === childrenArr.length - 1
                      ? 'last'
                      : 'middle'
              }
            >
              {child}
            </AccordionItemPositionContext.Provider>
          );
        })}
      </Comp>
    </AccordionContext.Provider>
  );
});

type AccordionItemContextValue = {
  value: string;
  triggerId: string;
  expanded: boolean;
  disabled?: boolean;
};

const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error('useAccordionItem must be used within a <AccordionItem />');
  }
  return ctx;
};

type AccordionItemProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    value: string;
    disabled?: boolean;
  };

const AccordionItem = genericForwardRef(function AccordionItem<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    disabled: disabledProp,
    value,
    style,
    ...restProps
  }: AccordionItemProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const {
    value: rootValue,
    type,
    disabled: rootDisabled,
    color,
    variant,
  } = useAccordion();
  const position = useAccordionItemPosition();

  const { styles } = useStyles(stylesheet, {
    variant,
    position,
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

  const Comp = as || View;

  return (
    <AccordionItemContext.Provider
      value={{ expanded, disabled, triggerId, value }}
    >
      <Comp
        ref={ref}
        style={[styles.accordionItem(color), style]}
        {...restProps}
      />
    </AccordionItemContext.Provider>
  );
});

type AccordionTriggerProps<T extends React.ElementType = typeof Pressable> =
  Omit<PolymorphicProps<T>, 'nativeID' | 'children'> & {
    children?:
      | React.ReactNode
      | ((state: { disabled: boolean; expanded: boolean }) => React.ReactNode);
  };

const AccordionTrigger = genericForwardRef(function AccordionTrigger<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    children,
    accessibilityState,
    disabled: disabledProp,
    onPress: onPressProp,
    style: styleProp,
    ...restProps
  }: AccordionTriggerProps<T>,
  ref: React.ForwardedRef<View>,
) {
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
      if (type === 'single') {
        onValueChange(expanded ? '' : itemValue);
      } else {
        const rootMultipleValue = rootValue as string[];
        onValueChange(
          expanded
            ? rootMultipleValue.filter((v) => v !== itemValue)
            : [...rootMultipleValue, itemValue],
        );
      }
      onPressProp?.(e);
    },
    [type, expanded, itemValue, rootValue, onPressProp, onValueChange],
  );

  const Comp = as || Pressable;

  return (
    <View accessibilityRole="header">
      <Comp
        ref={ref}
        nativeID={triggerId}
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          expanded,
          ...accessibilityState,
        }}
        disabled={disabled}
        onPress={onPress}
        style={(state) => [
          styles.accordionTrigger(state.pressed, color),
          typeof styleProp === 'function' ? styleProp(state) : styleProp,
        ]}
        {...restProps}
      >
        {typeof children === 'function'
          ? children({ disabled, expanded })
          : children}
      </Comp>
    </View>
  );
});

type AccordionIndicatorProps<
  T extends React.ElementType = typeof Animated.View,
> = PolymorphicProps<T> & {
  transition?: 'rotate' | 'flip';
};

/**
 * It helps to animate trigger indicator(e.g. icon).
 */
const AccordionIndicator = genericForwardRef(function AccordionIndicator<
  T extends React.ElementType<
    React.ComponentPropsWithoutRef<typeof Animated.View>
  >,
>(
  { transition = 'rotate', style, ...restProps }: AccordionIndicatorProps<T>,
  ref: React.ForwardedRef<Animated.View>,
) {
  const { expanded } = useAccordionItem();

  const animatedStyle = useAnimatedStyle(() => {
    if (transition === 'flip') {
      // TODO: improve flip animation
      return {
        transform: [
          {
            rotateY: expanded
              ? withTiming('180deg', animConfig)
              : withTiming('0deg', animConfig),
          },
        ],
      };
    }
    return {
      transform: [
        {
          rotate: expanded
            ? withTiming('180deg', animConfig)
            : withTiming('0deg', animConfig),
        },
      ],
    };
  });

  return (
    <Animated.View ref={ref} style={[animatedStyle, style]} {...restProps} />
  );
});

type AccordionContentProps<T extends React.ElementType = typeof View> = Omit<
  PolymorphicProps<T>,
  'accessibilityLabelledBy'
>;

const AccordionContent = genericForwardRef(function AccordionContent<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    accessibilityRole = 'summary',
    style,
    ...restProps
  }: AccordionContentProps<T>,
  ref: React.ForwardedRef<View>,
) {
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

  const Comp = as || View;

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
            ref={ref}
            accessibilityRole={accessibilityRole}
            accessibilityLabelledBy={triggerId}
            style={[styles.accordionContent, style]}
            {...restProps}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
});

const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
  accordion: {
    overflow: 'hidden',
    gap: space[2],
  },
  accordionItem: (color: Color) => ({
    borderCurve: 'continuous',
    overflow: 'hidden',
    variants: {
      variant: {
        soft: {
          backgroundColor: colors[`${color}3`],
        },
      },
      position: {
        single: {
          borderRadius: radius.md,
        },
        first: {
          borderTopStartRadius: radius.md,
          borderTopEndRadius: radius.md,
          borderBottomStartRadius: radius.xs,
          borderBottomEndRadius: radius.xs,
        },
        last: {
          borderTopStartRadius: radius.xs,
          borderTopEndRadius: radius.xs,
          borderBottomStartRadius: radius.md,
          borderBottomEndRadius: radius.md,
        },
        middle: {
          borderRadius: radius.xs,
        },
      },
    },
  }),
  accordionTrigger: (pressed: boolean, color: Color) => ({
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space[12],
    minHeight: 52,
    height: 'auto',
    paddingHorizontal: space[20],
    variants: {
      variant: {
        soft: {
          backgroundColor: pressed ? colors[`${color}4`] : colors[`${color}3`],
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
  AccordionIndicator,
  AccordionContent,
  useAccordion,
  useAccordionItem,
};
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionIndicatorProps,
  AccordionContentProps,
};
