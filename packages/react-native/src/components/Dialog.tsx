import * as React from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  ReduceMotion,
} from 'react-native-reanimated';

import { Text, TextProps } from './Text';
import { Portal, PortalProps } from '@/utils/portal';
import { useComposedRefs } from '@/utils/composeRefs';
import { useControllableState } from '@/hooks/useControllableState';
import { useInsets } from '@/hooks/useInsets';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type DialogContextValue = {
  closeOnPressOutside: boolean;
  closeOnBackPress: boolean;
  defaultOpen: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<View>;
  titleId: string;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

const useDialog = () => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a <Dialog />');
  }
  return ctx;
};

type DialogProps = {
  children: React.ReactNode;
  closeOnPressOutside?: boolean;
  closeOnBackPress?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const Dialog = ({
  children,
  closeOnPressOutside = true,
  closeOnBackPress = true,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: DialogProps) => {
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen,
    controlledValue: openProp,
    onControlledChange: onOpenChange,
  });

  const triggerRef = React.useRef<View>(null);

  const onOpen = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onClose = React.useCallback(() => {
    setOpen(false);
    // move accessibility focus back to the trigger
    if (triggerRef.current) {
      const reactTag = findNodeHandle(triggerRef.current);
      if (reactTag === null) {
        return;
      }
      // BUG(react-native): 'setAccessibilityFocus' is not working on iOS
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }, [setOpen]);

  return (
    <DialogContext.Provider
      value={{
        closeOnPressOutside,
        closeOnBackPress,
        defaultOpen,
        open,
        onOpen,
        onClose,
        triggerRef,
        titleId: React.useId(),
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

type DialogTriggerProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T>;

const DialogTrigger = genericForwardRef(function DialogTrigger<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    children,
    accessibilityState,
    disabled,
    onPress: onPressProp,
    ...restProps
  }: DialogTriggerProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { open, onOpen, triggerRef } = useDialog();

  const composedRefs = useComposedRefs(triggerRef, ref);

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onOpen();
      onPressProp?.(e);
    },
    [onPressProp, onOpen],
  );

  const Comp = as || Pressable;

  return (
    <Comp
      ref={composedRefs}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled ?? accessibilityState?.disabled,
        expanded: open,
        ...accessibilityState,
      }}
      disabled={disabled}
      onPress={onPress}
      {...restProps}
    >
      {children}
    </Comp>
  );
});

type DialogPortalProps = PortalProps;

const DialogPortal = ({ children, containerId }: DialogPortalProps) => {
  const ctx = useDialog();
  if (!ctx.open) return;
  return (
    <Portal containerId={containerId}>
      <DialogContext.Provider value={ctx}>{children}</DialogContext.Provider>
    </Portal>
  );
};

DialogPortal.displayName = 'DialogPortal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type DialogOverlayProps<T extends React.ElementType = typeof Pressable> = Omit<
  PolymorphicProps<T>,
  'style'
> & {
  // BUG: callback as a style prop is not working with AnimatedPressable
  style?: StyleProp<ViewStyle>;
};

const DialogOverlay = genericForwardRef(function DialogOverlay<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  { as, onPress: onPressProp, style, ...restProps }: DialogOverlayProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { onClose, closeOnPressOutside } = useDialog();

  const { styles } = useStyles(stylesheet);

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      if (closeOnPressOutside) onClose();
      onPressProp?.(e);
    },
    [closeOnPressOutside, onClose, onPressProp],
  );

  const Comp = as || AnimatedPressable;

  return (
    <Comp
      ref={ref}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      entering={FadeIn.duration(animConfig.duration)
        .easing(animConfig.easing)
        .reduceMotion(animConfig.reduceMotion)}
      exiting={FadeOut.duration(animConfig.duration)
        .easing(animConfig.easing)
        .reduceMotion(animConfig.reduceMotion)}
      onPress={onPress}
      style={[styles.overlay, style]}
      {...restProps}
    />
  );
});

type DialogContentProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    height?: number;
    minHeight?: number;
    maxHeight?: number;
    containerStyle?: StyleProp<ViewStyle>;
  };

const DialogContent = genericForwardRef(function DialogContent<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    children,
    width,
    minWidth,
    maxWidth = 600,
    height,
    minHeight,
    maxHeight: maxHeightProp,
    containerStyle: containerStyleProp,
    style,
    ...restProps
  }: DialogContentProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { titleId, onClose, closeOnBackPress } = useDialog();

  const { styles } = useStyles(stylesheet);
  const { height: screenHeight } = useScreenDimensions();
  const insets = useInsets();
  const maxHeight = maxHeightProp ?? screenHeight - insets.top - insets.bottom;

  React.useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (closeOnBackPress) {
        onClose();
      }
      return true;
    });
    return () => listener.remove();
  }, [closeOnBackPress, onClose]);

  const Comp = as || Animated.View;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.contentContainerStyle, containerStyleProp]}
    >
      <Comp
        ref={ref}
        accessibilityLabelledBy={titleId}
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        importantForAccessibility="yes"
        entering={entryAnim
          .duration(animConfig.duration)
          .reduceMotion(animConfig.reduceMotion)}
        exiting={exitAnim
          .duration(animConfig.duration)
          .reduceMotion(animConfig.reduceMotion)}
        onAccessibilityEscape={onClose}
        style={[
          styles.content,
          style,
          {
            width,
            minWidth,
            maxWidth,
            height,
            minHeight,
            maxHeight,
          },
        ]}
        {...restProps}
      >
        {children}
      </Comp>
    </View>
  );
});

type DialogTitleProps<T extends React.ElementType = typeof Text> = Omit<
  TextProps<T>,
  'nativeID'
>;

const DialogTitle = genericForwardRef(function DialogTitle<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: DialogTitleProps<T>, ref: React.ForwardedRef<T>) {
  const { titleId } = useDialog();

  return (
    <Text
      ref={ref}
      nativeID={titleId}
      variant="headingSm"
      highContrast
      {...props}
    />
  );
});

type DialogDescriptionProps<T extends React.ElementType = typeof Text> =
  TextProps<T>;

const DialogDescription = genericForwardRef(function DialogDescription<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: DialogDescriptionProps<T>, ref: React.ForwardedRef<T>) {
  return <Text ref={ref} variant="bodyMd" {...props} />;
});

type DialogCloseProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T>;

const DialogClose = genericForwardRef(function DialogClose<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  { as, onPress: onPressProp, ...restProps }: DialogCloseProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { onClose } = useDialog();

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onClose();
      onPressProp?.(e);
    },
    [onClose, onPressProp],
  );

  const Comp = as || Pressable;
  return (
    <Comp
      ref={ref}
      accessibilityRole="button"
      onPress={onPress}
      {...restProps}
    />
  );
});

const stylesheet = createStyleSheet(({ colors, radius, space }, rt) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  contentContainerStyle: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: space[16],
  },
  content: {
    width: '100%',
    gap: space[8],
    padding: space[20],
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.neutral2,
  },
}));

const entryAnim = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.95 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: animConfig.easing,
  },
});

const exitAnim = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  100: {
    opacity: 0,
    transform: [{ scale: 0.95 }],
    easing: animConfig.easing,
  },
});

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContext,
  useDialog,
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogContextValue,
};
