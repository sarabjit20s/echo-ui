import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  ReduceMotion,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import {
  Popup,
  PopupAnchor,
  PopupAnchorProps,
  PopupArrow,
  PopupArrowProps,
  PopupClose,
  PopupCloseProps,
  PopupContent,
  PopupContentProps,
  PopupOverlay,
  PopupPortal,
  PopupProps,
  PopupTrigger,
  PopupTriggerProps,
} from './Popup';
import { genericForwardRef } from '@/utils/genericForwardRef';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type PopoverProps = PopupProps;

const Popover = Popup;

type PopoverTriggerProps = PopupTriggerProps;

const PopoverTrigger = PopupTrigger;

type PopoverAnchorProps = PopupAnchorProps;

const PopoverAnchor = PopupAnchor;

const AnimatedPopupOverlay = Animated.createAnimatedComponent(PopupOverlay);
const AnimatedPopupContent = Animated.createAnimatedComponent(PopupContent);

type PopoverContentProps<T extends React.ElementType = typeof PopupContent> =
  PopupContentProps<T>;

const PopoverContent = genericForwardRef(function PopoverContent<
  T extends React.ElementType<
    React.ComponentPropsWithoutRef<typeof PopupContent>
  >,
>(
  { style, ...restProps }: PopoverContentProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet);

  return (
    <PopupPortal>
      <AnimatedPopupOverlay
        entering={FadeIn.duration(animConfig.duration)
          .easing(animConfig.easing)
          .reduceMotion(animConfig.reduceMotion)}
        exiting={FadeOut.duration(animConfig.duration)
          .easing(animConfig.easing)
          .reduceMotion(animConfig.reduceMotion)}
        style={styles.overlay}
      />
      <AnimatedPopupContent
        ref={ref}
        style={[styles.content, style]}
        entering={entryAnim
          .duration(animConfig.duration)
          .reduceMotion(animConfig.reduceMotion)}
        exiting={exitAnim
          .duration(animConfig.duration)
          .reduceMotion(animConfig.reduceMotion)}
        {...restProps}
      />
    </PopupPortal>
  );
});

type PopoverArrowProps = PopupArrowProps;

const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopupArrow>,
  PopoverArrowProps
>(function PopoverArrow(props, ref) {
  const { theme } = useStyles();
  return (
    <PopupArrow
      ref={ref}
      arrowColor={theme.colors.neutral2}
      arrowSize={6}
      {...props}
    />
  );
});

type PopoverCloseProps = PopupCloseProps;

const PopoverClose = PopupClose;

const stylesheet = createStyleSheet(({ colors, space, radius }) => ({
  overlay: {
    backgroundColor: colors.overlayMuted,
  },
  content: {
    backgroundColor: colors.neutral2,
    padding: space[16],
    borderRadius: radius.md,
    borderCurve: 'continuous',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 24,
  },
}));

const entryAnim = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.75 }],
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
    transform: [{ scale: 0.75 }],
    easing: animConfig.easing,
  },
});

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverArrow,
  PopoverClose,
};

export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverAnchorProps,
  PopoverContentProps,
  PopoverArrowProps,
  PopoverCloseProps,
};
