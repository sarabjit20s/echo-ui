import React from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  ColorValue,
  findNodeHandle,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Slot } from '@/utils/slot';
import { Portal, PortalProps } from '@/utils/portal';
import { useComposedRefs } from '@/utils/composeRefs';
import { useControllableState } from '@/hooks/useControllableState';
import { usePositioning, Placement, ArrowData } from '@/hooks/usePositioning';
import { useScreenDimensions } from '@/hooks/useScreenDimensions';
import { useInsets } from '@/hooks/useInsets';

type PopupContextValue = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  anchorRef: React.RefObject<View>;
  triggerRef: React.RefObject<View>;
  positionUpdaterRef: React.MutableRefObject<() => void>;
  closeOnPressOutside: boolean;
  closeOnBackPress: boolean;
};

const PopupContext = React.createContext<PopupContextValue | null>(null);

const usePopup = () => {
  const ctx = React.useContext(PopupContext);
  if (!ctx) {
    throw new Error('usePopup must be used within a <Popup />');
  }
  return ctx;
};

type PopupProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnPressOutside?: boolean;
  closeOnBackPress?: boolean;
};

const Popup = ({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  closeOnPressOutside = true,
  closeOnBackPress = true,
}: PopupProps) => {
  const [open, setOpen] = useControllableState({
    defaultValue: defaultOpen,
    controlledValue: openProp,
    onControlledChange: onOpenChange,
  });

  const anchorRef = React.useRef<View>(null);
  const triggerRef = React.useRef<View>(null);
  const positionUpdaterRef = React.useRef<() => void>(() => {});

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
    <PopupContext.Provider
      value={{
        open,
        onOpen,
        onClose,
        anchorRef,
        triggerRef,
        positionUpdaterRef,
        closeOnPressOutside,
        closeOnBackPress,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

Popup.displayName = 'Popup';

type PopupTriggerProps = PressableProps & {
  asChild?: boolean;
};

const PopupTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PopupTriggerProps
>(
  (
    {
      asChild,
      accessibilityState,
      disabled,
      onPress: onPressProp,
      onLayout: onLayoutProp,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { open, triggerRef, onOpen, onClose, positionUpdaterRef } =
      usePopup();

    const ref = useComposedRefs(forwardedRef, triggerRef);

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        if (open) {
          onClose();
        } else {
          onOpen();
        }
        onPressProp?.(e);
      },
      [onPressProp, onOpen, onClose, open],
    );

    const onLayout = React.useCallback(
      (e: LayoutChangeEvent) => {
        positionUpdaterRef.current();
        onLayoutProp?.(e);
      },
      [onLayoutProp, positionUpdaterRef],
    );

    const Comp = asChild ? Slot : Pressable;
    return (
      <Comp
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          disabled: disabled ?? accessibilityState?.disabled,
          expanded: open,
        }}
        collapsable={false}
        disabled={disabled}
        onPress={onPress}
        onLayout={onLayout}
        {...restProps}
      />
    );
  },
);

PopupTrigger.displayName = 'PopupTrigger';

type PopupAnchorProps = ViewProps & {
  asChild?: boolean;
};
const PopupAnchor = React.forwardRef<
  React.ElementRef<typeof View>,
  PopupAnchorProps
>(({ asChild, onLayout: onLayoutProp, ...restProps }, forwardedRef) => {
  const { anchorRef, positionUpdaterRef } = usePopup();

  const ref = useComposedRefs(forwardedRef, anchorRef);

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      positionUpdaterRef.current();
      onLayoutProp?.(e);
    },
    [onLayoutProp, positionUpdaterRef],
  );

  const Comp = asChild ? Slot : View;
  return (
    <Comp ref={ref} collapsable={false} onLayout={onLayout} {...restProps} />
  );
});

PopupAnchor.displayName = 'PopupAnchor';

type PopupPortalProps = PortalProps;

const PopupPortal = ({ children, containerId }: PopupPortalProps) => {
  const ctx = usePopup();
  if (!ctx.open) return;
  return (
    <Portal containerId={containerId}>
      <PopupContext.Provider value={ctx}>{children}</PopupContext.Provider>
    </Portal>
  );
};

PopupPortal.displayName = 'PopupPortal';

type PopupOverlayProps = PressableProps & {
  asChild?: boolean;
};

const PopupOverlay = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PopupOverlayProps
>(({ asChild, onPress: onPressProp, style, ...restProps }, forwardedRef) => {
  const { onClose, closeOnPressOutside } = usePopup();

  const { styles } = useStyles(stylesheet);

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      if (closeOnPressOutside) onClose();
      onPressProp?.(e);
    },
    [closeOnPressOutside, onClose, onPressProp],
  );

  const Comp = asChild ? Slot : Pressable;
  return (
    <Comp
      ref={forwardedRef}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onPress={onPress}
      style={(state) => [
        styles.overlay,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...restProps}
    />
  );
});

PopupOverlay.displayName = 'PopupOverlay';

type PopupContentContextValue = {
  arrowRef: React.RefObject<View>;
  arrowData: ArrowData | null;
  canRenderArrow: boolean;
  placement: Placement;
};

const PopupContentContext =
  React.createContext<PopupContentContextValue | null>(null);

const usePopupContent = () => {
  const ctx = React.useContext(PopupContentContext);
  if (!ctx) {
    throw new Error(
      'usePopupContent must be used with in the <PopupContent />',
    );
  }
  return ctx;
};

type PopupContentProps = ViewProps & {
  asChild?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  mainAxisOffset?: number;
  arrowMainAxisOffset?: number;
  placement?: Placement;
  avoidCollisions?: boolean;
  coverAnchorToAvoidCollisions?: boolean;
};

const PopupContent = React.forwardRef<
  React.ElementRef<typeof View>,
  PopupContentProps
>(
  (
    {
      children,
      asChild,
      width,
      minWidth,
      maxWidth: maxWidthProp,
      height,
      minHeight,
      maxHeight: maxHeightProp,
      avoidCollisions = true,
      coverAnchorToAvoidCollisions = true,
      mainAxisOffset: mainAxisOffsetProp = 0,
      arrowMainAxisOffset = 0,
      placement = 'bottom',
      onLayout: onLayoutProp,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const {
      anchorRef,
      triggerRef,
      onClose,
      closeOnBackPress,
      positionUpdaterRef,
    } = usePopup();

    const { styles } = useStyles(stylesheet);

    const contentRef = React.useRef<View>(null);
    const arrowRef = React.useRef(null);

    const {
      x,
      y,
      isPositioned,
      update,
      placement: finalPlacement,
      arrowData,
      canRenderArrow,
    } = usePositioning({
      anchorRef: anchorRef.current ? anchorRef : triggerRef,
      targetRef: contentRef,
      arrowRef,
      avoidCollisions,
      placement,
      mainAxisOffset: mainAxisOffsetProp,
      arrowMainAxisOffset,
      isTargetHeightFixed: height !== undefined,
      coverAnchorToAvoidCollisions,
    });

    const { width: screenWidth, height: screenHeight } = useScreenDimensions();
    const insets = useInsets();
    const maxWidth = maxWidthProp ?? screenWidth;
    const maxHeight =
      maxHeightProp ?? screenHeight - insets.top - insets.bottom;

    // A default value based on the placement which can be helpful
    // for animations(like scale animation)
    const transformOrigin = getTransformOrigin(finalPlacement);

    const refs = useComposedRefs(forwardedRef, contentRef);

    React.useEffect(() => {
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        if (closeOnBackPress) {
          onClose();
        }
        return true;
      });
      return () => listener.remove();
    }, [closeOnBackPress, onClose]);

    React.useEffect(() => {
      positionUpdaterRef.current = () => update();
    }, [update, positionUpdaterRef]);

    const onLayout = React.useCallback(
      (e: LayoutChangeEvent) => {
        update();
        onLayoutProp?.(e);
      },
      [onLayoutProp, update],
    );

    const Comp = asChild ? Slot : View;
    return (
      <PopupContentContext.Provider
        value={{
          arrowRef,
          arrowData,
          canRenderArrow,
          placement: finalPlacement,
        }}
      >
        <Comp
          ref={refs}
          accessibilityViewIsModal
          accessibilityLiveRegion="polite"
          importantForAccessibility="yes"
          collapsable={false}
          onAccessibilityEscape={onClose}
          onLayout={onLayout}
          style={[
            styles.content,
            isPositioned
              ? {
                  top: y,
                  left: x,
                  transformOrigin,
                }
              : styles.keepOffScreen,
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
      </PopupContentContext.Provider>
    );
  },
);

PopupContent.displayName = 'PopupContent';

type PopupArrowProps = {
  arrowSize?: number;
  arrowColor?: ColorValue;
};

/**
 * It should be rendered inside the PopupContent component
 */
const PopupArrow = React.forwardRef<
  React.ElementRef<typeof Svg>,
  PopupArrowProps
>(({ arrowSize = 6, arrowColor }, forwardedRef) => {
  const { arrowRef, arrowData, canRenderArrow } = usePopupContent();
  const { theme } = useStyles();

  const refs = useComposedRefs(arrowRef as any, forwardedRef);

  const width = arrowSize * 2;
  const height = arrowSize;
  // stroke width can be added to make the corners rounded with `strokeLinejoin` prop
  // while keeping the size constant
  const strokeWidth = 0;
  const halfStroke = strokeWidth / 2;
  const color = arrowColor ?? theme.colors.neutral2;

  return (
    canRenderArrow && (
      <Svg
        ref={refs}
        width={width}
        height={height}
        collapsable={false}
        style={[arrowData?.style]}
      >
        <Path
          d={`M${width / 2} ${halfStroke} L${halfStroke} ${height - halfStroke} L${width - halfStroke} ${height - halfStroke} Z`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={color}
        />
      </Svg>
    )
  );
});

PopupArrow.displayName = 'PopupArrow';

type PopupCloseProps = PressableProps & {
  asChild?: boolean;
};

const PopupClose = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PopupCloseProps
>(({ asChild, onPress: onPressProp, ...restProps }, forwardedRef) => {
  const { onClose } = usePopup();

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

PopupClose.displayName = 'PopupClose';

const stylesheet = createStyleSheet(({ colors, radius }, rt) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.transparent,
  },
  content: {
    position: 'absolute',
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  keepOffScreen: {
    position: 'absolute',
    top: -9999 - rt.screen.height,
    left: -9999 - rt.screen.width,
  },
}));

function getTransformOrigin(placement: Placement) {
  let result: string;
  switch (placement) {
    case 'top':
      result = 'center bottom';
      break;
    case 'top-start':
      result = 'left bottom';
      break;
    case 'top-end':
      result = 'right bottom';
      break;
    case 'bottom':
      result = 'center top';
      break;
    case 'bottom-start':
      result = 'left top';
      break;
    case 'bottom-end':
      result = 'right top';
      break;
    case 'left':
      result = 'right center';
      break;
    case 'left-start':
      result = 'right top';
      break;
    case 'left-end':
      result = 'right bottom';
      break;
    case 'right':
      result = 'left center';
      break;
    case 'right-start':
      result = 'left top';
      break;
    case 'right-end':
      result = 'left bottom';
      break;
    default:
      result = 'center center';
  }
  return result;
}

export {
  Popup,
  PopupTrigger,
  PopupAnchor,
  PopupPortal,
  PopupOverlay,
  PopupContent,
  PopupArrow,
  PopupClose,
  usePopup,
  usePopupContent,
};
export type {
  PopupProps,
  PopupTriggerProps,
  PopupAnchorProps,
  PopupPortalProps,
  PopupOverlayProps,
  PopupContentProps,
  PopupArrowProps,
  PopupCloseProps,
};
