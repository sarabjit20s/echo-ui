import * as React from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
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

import { useControllableState } from '@/hooks/useControllableState';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type CollapsibleContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(
  null,
);

const useCollapsible = () => {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error('useCollapsible must be used within a <Collapsible />');
  }
  return ctx;
};

type CollapsibleProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

const Collapsible = ({
  children,
  defaultOpen,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  disabled = false,
}: CollapsibleProps) => {
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen ?? false,
    controlledValue: openProp,
    onControlledChange: onOpenChangeProp,
  });

  return (
    <CollapsibleContext.Provider
      value={{ open, onOpenChange: setOpen, disabled }}
    >
      {children}
    </CollapsibleContext.Provider>
  );
};

type CollapsibleTriggerProps<T extends React.ElementType = typeof Pressable> =
  Omit<PolymorphicProps<T>, 'children'> & {
    children?:
      | React.ReactNode
      | ((state: { disabled: boolean; expanded: boolean }) => React.ReactNode);
  };

const CollapsibleTrigger = genericForwardRef(function CollapsibleTrigger<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    accessibilityState,
    children,
    disabled: disabledProp,
    onPress: onPressProp,
    ...restProps
  }: CollapsibleTriggerProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { open, onOpenChange, disabled: ctxDisabled } = useCollapsible();

  const disabled = disabledProp ?? ctxDisabled;

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onOpenChange(!open);
      onPressProp?.(e);
    },
    [onOpenChange, open, onPressProp],
  );

  const Comp = as || Pressable;

  return (
    <Comp
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{
        expanded: open,
        disabled,
        ...accessibilityState,
      }}
      disabled={disabled}
      onPress={onPress}
      {...restProps}
    >
      {typeof children === 'function'
        ? children({ disabled, expanded: open })
        : children}
    </Comp>
  );
});

type CollapsibleContentProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T>;

const CollapsibleContent = genericForwardRef(function CollapsibleContent<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  { as, ...restProps }: CollapsibleContentProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { open } = useCollapsible();

  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: '100%',
      height: open
        ? withTiming(height.value, animConfig)
        : withTiming(0, animConfig),
      overflow: 'hidden',
    };
  });

  const containerStyle: ViewProps['style'] = React.useMemo(
    () => ({
      position: 'absolute',
      width: '100%',
    }),
    [],
  );

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      height.value = e.nativeEvent.layout.height;
    },
    [height],
  );

  const Comp = as || View;

  return (
    <Animated.View style={animatedStyle}>
      {open && (
        <Animated.View
          entering={FadeIn.duration(animConfig.duration)
            .easing(animConfig.easing)
            .reduceMotion(animConfig.reduceMotion)}
          exiting={FadeOut.duration(animConfig.duration)
            .easing(animConfig.easing)
            .reduceMotion(animConfig.reduceMotion)}
          onLayout={onLayout}
          style={containerStyle}
        >
          <Comp ref={ref} {...restProps} />
        </Animated.View>
      )}
    </Animated.View>
  );
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent, useCollapsible };
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
};
