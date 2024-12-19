import React from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  findNodeHandle,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
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
import { Slot } from '@/utils/slot';
import { useComposedRefs } from '@/utils/composeRefs';
import { useControllableState } from '@/hooks/useControllableState';
import { useInsets } from '@/hooks/useInsets';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';

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

Dialog.displayName = 'Dialog';

type DialogTriggerProps = PressableProps & {
  asChild?: boolean;
};

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogTriggerProps
>(
  (
    {
      asChild = false,
      children,
      accessibilityState,
      disabled,
      onPress: onPressProp,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { open, onOpen, triggerRef } = useDialog();

    const composedRefs = useComposedRefs(triggerRef, forwardedRef);

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onOpen();
        onPressProp?.(e);
      },
      [onPressProp, onOpen],
    );

    const Comp = asChild ? Slot : Pressable;

    return (
      <Comp
        ref={composedRefs}
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          disabled: disabled ?? accessibilityState?.disabled,
          expanded: open,
        }}
        disabled={disabled}
        onPress={onPress}
        {...restProps}
      >
        {children}
      </Comp>
    );
  },
);

DialogTrigger.displayName = 'DialogTrigger';

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

type DialogOverlayProps = Omit<PressableProps, 'style'> & {
  asChild?: boolean;
  // callback as a style prop is not working with AnimatedPressable
  style?: StyleProp<ViewStyle>;
};

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogOverlayProps
>(({ asChild, onPress: onPressProp, style, ...restProps }, forwardedRef) => {
  const { onClose, closeOnPressOutside } = useDialog();

  const { styles } = useStyles(stylesheet);

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      if (closeOnPressOutside) onClose();
      onPressProp?.(e);
    },
    [closeOnPressOutside, onClose, onPressProp],
  );

  const Comp = asChild ? Slot : AnimatedPressable;

  return (
    <Comp
      ref={forwardedRef}
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

DialogOverlay.displayName = 'DialogOverlay';

type DialogContentProps = ViewProps & {
  asChild?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DialogContentProps
>(
  (
    {
      children,
      asChild,
      width,
      minWidth,
      maxWidth = 600,
      height,
      minHeight,
      maxHeight: maxHeightProp,
      containerStyle: containerStyleProp,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { titleId, onClose, closeOnBackPress } = useDialog();

    const { styles } = useStyles(stylesheet);
    const { height: screenHeight } = useScreenDimensions();
    const insets = useInsets();
    const maxHeight =
      maxHeightProp ?? screenHeight - insets.top - insets.bottom;

    React.useEffect(() => {
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        if (closeOnBackPress) {
          onClose();
        }
        return true;
      });
      return () => listener.remove();
    }, [closeOnBackPress, onClose]);

    const Comp = asChild ? Slot : Animated.View;

    return (
      <View
        pointerEvents="box-none"
        style={[styles.contentContainerStyle, containerStyleProp]}
      >
        <Comp
          ref={forwardedRef}
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
  },
);

DialogContent.displayName = 'DialogContent';

// nativeId is used for accessibility
type DialogTitleProps = Omit<TextProps, 'nativeID'>;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Text>,
  DialogTitleProps
>((props, forwardedRef) => {
  const { titleId } = useDialog();

  return (
    <Text
      ref={forwardedRef}
      nativeID={titleId}
      variant="headingSm"
      highContrast
      {...props}
    />
  );
});

DialogTitle.displayName = 'DialogTitle';

type DialogDescriptionProps = TextProps;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  DialogDescriptionProps
>((props, forwardedRef) => {
  return <Text ref={forwardedRef} variant="bodyMd" {...props} />;
});

DialogDescription.displayName = 'DialogDescription';

type DialogCloseProps = PressableProps & {
  asChild?: boolean;
};

const DialogClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DialogCloseProps
>(({ asChild, onPress: onPressProp, ...restProps }, forwardedRef) => {
  const { onClose } = useDialog();

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onClose();
      onPressProp?.(e);
    },
    [onClose, onPressProp],
  );

  const Comp = asChild ? Slot : Pressable;
  return (
    <Comp
      ref={forwardedRef}
      accessibilityRole="button"
      onPress={onPress}
      {...restProps}
    />
  );
});

DialogClose.displayName = 'DialogClose';

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
    backgroundColor: colors.neutral1,
  },
}));

const entryAnim = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.9 }],
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
    transform: [{ scale: 0.9 }],
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
};
