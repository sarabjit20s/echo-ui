import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import Animated, {
  Easing,
  LinearTransition,
  Keyframe,
  runOnJS,
  ReduceMotion,
} from 'react-native-reanimated';

import {
  Popup,
  PopupArrow,
  PopupClose,
  PopupCloseProps,
  PopupContent,
  PopupContentProps,
  PopupOverlay,
  PopupPortal,
  PopupProps,
  PopupTrigger,
  PopupTriggerProps,
  usePopup,
} from './Popup';
import { Separator, SeparatorProps } from './Separator';
import { Text, TextProps } from './Text';
import { Icon, IconProps } from './Icon';
import { Checkbox, CheckboxIndicator, CheckboxProps } from './Checkbox';
import {
  RadioGroupItem,
  RadioGroup,
  RadioGroupProps,
  RadioGroupItemProps,
  RadioGroupIndicator,
  useRadioGroup,
} from './RadioGroup';
import { Slot } from '@/utils/slot';
import { Color } from '@/styles/tokens/colors';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type DropdownMenuProps = PopupProps;

const DropdownMenu = Popup;

DropdownMenu.displayName = 'DropdownMenu';

type DropdownMenuTriggerProps = PopupTriggerProps;

const DropdownMenuTrigger = PopupTrigger;

type SubMenu = {
  id: string;
  Component: React.ElementType;
};
type DropdownMenuContentContextValue = {
  addSubMenu: (menu: SubMenu) => void;
  onSubMenuTriggerPress: (id: string) => void;
  onSubMenuBackPress: () => void;
};

const DropdownMenuContentContext =
  React.createContext<DropdownMenuContentContextValue | null>(null);

const useDropdownMenuContent = () => {
  const ctx = React.useContext(DropdownMenuContentContext);
  if (!ctx) {
    throw new Error(
      'useDropdownMenuContent must be used within a <DropdownMenuContent />',
    );
  }
  return ctx;
};

type DropdownMenuContentProps = PopupContentProps & {
  showArrow?: boolean;
};

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuContentProps
>((props, forwardedRef) => {
  const { styles } = useStyles(stylesheet);

  return (
    <PopupPortal>
      <PopupOverlay style={styles.overlay} />
      <DropdownMenuContentImpl ref={forwardedRef} {...props} />
    </PopupPortal>
  );
});

DropdownMenuContent.displayName = 'DropdownMenuContent';

const AnimatedPopupContent = Animated.createAnimatedComponent(PopupContent);

type DropdownMenuContentImplProps = DropdownMenuContentProps;

const DropdownMenuContentImpl = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuContentImplProps
>(({ children, showArrow = false, style, ...restProps }, forwardedRef) => {
  const { styles, theme } = useStyles(stylesheet);

  const subMenusRef = React.useRef<Map<string, SubMenu>>(new Map());
  const subMenuHistoryRef = React.useRef<string[]>([]);
  const [activeSubMenu, setActiveSubMenu] = React.useState<SubMenu | null>();

  const [layoutAnimProps, setLayoutAnimProps] = React.useState<{
    layout: React.ComponentProps<typeof AnimatedPopupContent>['layout'];
  } | null>(null);
  const [isEnteringAnimFinished, setIsEnteringAnimFinished] =
    React.useState(false);

  const addSubMenu = React.useCallback((subMenu: SubMenu) => {
    subMenusRef.current?.set(subMenu.id, subMenu);
  }, []);

  const onSubMenuTriggerPress = React.useCallback((id: string) => {
    const subMenu = subMenusRef.current?.get(id);
    if (subMenu) {
      subMenuHistoryRef.current.push(id);
      setActiveSubMenu(subMenu);
    }
  }, []);

  const onSubMenuBackPress = React.useCallback(() => {
    subMenuHistoryRef.current.pop();
    const nextId =
      subMenuHistoryRef.current[subMenuHistoryRef.current.length - 1];
    if (nextId) {
      const subMenu = subMenusRef.current?.get(nextId);
      if (subMenu) {
        setActiveSubMenu(subMenu);
      } else {
        setActiveSubMenu(null);
      }
    } else {
      setActiveSubMenu(null);
    }
  }, []);

  const entryAnimCallback = React.useCallback((finished: boolean) => {
    'worklet';
    if (finished) {
      // add layout animation after the entering animation finishes
      // on Android directly assigning the 'LinearTransition' to the `layout` prop
      // interupts the `entering` animation
      runOnJS(setIsEnteringAnimFinished)(true);
    }
  }, []);

  React.useEffect(() => {
    if (isEnteringAnimFinished) {
      setLayoutAnimProps({
        layout: LinearTransition.duration(animConfig.duration)
          .easing(animConfig.easing)
          .reduceMotion(animConfig.reduceMotion),
      });
    }
  }, [isEnteringAnimFinished]);

  return (
    <AnimatedPopupContent
      ref={forwardedRef}
      minWidth={112}
      entering={entryAnim
        .duration(animConfig.duration)
        .reduceMotion(animConfig.reduceMotion)
        .withCallback(entryAnimCallback)}
      exiting={exitAnim
        .duration(animConfig.duration)
        .reduceMotion(animConfig.reduceMotion)}
      style={[styles.menuContainer, style]}
      {...layoutAnimProps}
      {...restProps}
    >
      {showArrow && (
        <PopupArrow arrowColor={theme.colors.neutral2} arrowSize={6} />
      )}
      <DropdownMenuContentContext.Provider
        value={{
          addSubMenu,
          onSubMenuTriggerPress,
          onSubMenuBackPress,
        }}
      >
        {activeSubMenu ? (
          <activeSubMenu.Component />
        ) : (
          <View accessibilityRole="menu" style={styles.menu}>
            {children}
          </View>
        )}
      </DropdownMenuContentContext.Provider>
    </AnimatedPopupContent>
  );
});

DropdownMenuContentImpl.displayName = 'DropdownMenuContentImpl';

type DropdownMenuLabelProps = TextProps;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Text>,
  DropdownMenuLabelProps
>(({ children, style, ...restProps }, forwardedRef) => {
  const { styles } = useStyles(stylesheet);
  return (
    <Text
      ref={forwardedRef}
      variant="labelSm"
      style={[styles.label, style]}
      {...restProps}
    >
      {children}
    </Text>
  );
});

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

type DropdownMenuItemContextValue = {
  color: Color;
  disabled: boolean;
};

const DropdownMenuItemContext =
  React.createContext<DropdownMenuItemContextValue | null>(null);

const useDropdownMenuItem = () => {
  const ctx = React.useContext(DropdownMenuItemContext);
  if (!ctx) {
    throw new Error(
      'useDropdownMenuItem must be used within a <DropdownMenuItem />',
    );
  }
  return ctx;
};

type DropdownMenuItemProps = PressableProps & {
  asChild?: boolean;
  color?: Color;
  closeOnPress?: boolean;
};

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuItemProps
>(
  (
    {
      asChild = false,
      accessibilityState,
      color = 'neutral',
      disabled = false,
      closeOnPress = true,
      onPress: onPressProp,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { onClose } = usePopup();

    const { styles } = useStyles(stylesheet);

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onPressProp?.(e);
        if (closeOnPress) {
          onClose();
        }
      },
      [onPressProp, onClose, closeOnPress],
    );

    const itemStyle = React.useCallback(
      (state: PressableStateCallbackType) => {
        return [
          styles.item(state.pressed, color),
          typeof style === 'function' ? style(state) : style,
        ];
      },
      [color, style, styles],
    );

    const Comp = asChild ? Slot : Pressable;

    return (
      <DropdownMenuItemContext.Provider value={{ color, disabled: !!disabled }}>
        <Comp
          ref={forwardedRef}
          accessibilityRole="menuitem"
          accessibilityState={{
            ...accessibilityState,
            disabled: !!disabled,
          }}
          disabled={disabled}
          onPress={onPress}
          style={itemStyle}
          {...restProps}
        />
      </DropdownMenuItemContext.Provider>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

type DropdownMenuItemTitleProps = TextProps;

const DropdownMenuItemTitle = React.forwardRef<
  React.ElementRef<typeof Text>,
  DropdownMenuItemTitleProps
>((props, forwardedRef) => {
  const { color, disabled } = useDropdownMenuItem();
  return (
    <Text
      ref={forwardedRef}
      variant="bodyMd"
      color={color}
      highContrast={color === 'neutral'}
      disabled={disabled}
      {...props}
    />
  );
});

DropdownMenuItemTitle.displayName = 'DropdownMenuItemTitle';

type DropdownMenuItemIconProps = IconProps & {
  isEndIcon?: boolean;
};

const DropdownMenuItemIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  DropdownMenuItemIconProps
>(({ isEndIcon = false, style, ...restProps }, forwardedRef) => {
  const { color, disabled } = useDropdownMenuItem();
  const { styles } = useStyles(stylesheet);

  return (
    <Icon
      ref={forwardedRef}
      size="lg"
      color={color}
      highContrast={color === 'neutral'}
      disabled={disabled}
      style={[isEndIcon && styles.endIcon, style]}
      {...restProps}
    />
  );
});

DropdownMenuItemIcon.displayName = 'DropdownMenuItemIcon';

type DropdownMenuCheckboxItemProps = Omit<
  CheckboxProps,
  'asChild' | 'children'
> & {
  children: React.ReactNode;
  closeOnPress?: boolean;
};

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuCheckboxItemProps
>(
  (
    {
      children,
      color = 'neutral',
      closeOnPress = true,
      disabled = false,
      onPress: onPressProp,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { onClose } = usePopup();

    const { styles } = useStyles(stylesheet);

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onPressProp?.(e);
        if (closeOnPress) {
          onClose();
        }
      },
      [onPressProp, onClose, closeOnPress],
    );

    const itemStyle = (state: PressableStateCallbackType) => {
      return [
        styles.item(state.pressed, color),
        styles.checkboxItem,
        typeof style === 'function' ? style(state) : style,
      ];
    };

    return (
      <DropdownMenuItemContext.Provider value={{ color, disabled: !!disabled }}>
        <Checkbox
          ref={forwardedRef}
          accessibilityRole="menuitem"
          color={color}
          variant="ghost"
          size="lg"
          highContrast={color === 'neutral'}
          disabled={disabled}
          onPress={onPress}
          style={itemStyle}
          {...restProps}
        >
          <CheckboxIndicator />
          {children}
        </Checkbox>
      </DropdownMenuItemContext.Provider>
    );
  },
);

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

type DropdownMenuRadioGroupProps = RadioGroupProps;

const DropdownMenuRadioGroup = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuRadioGroupProps
>(({ color = 'neutral', disabled = false, ...restProps }, forwardedRef) => {
  return (
    <RadioGroup
      ref={forwardedRef}
      color={color}
      size="md"
      variant="ghost"
      highContrast={color === 'neutral'}
      disabled={disabled}
      {...restProps}
    />
  );
});

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

type DropdownMenuRadioGroupItemProps = Omit<
  RadioGroupItemProps,
  'asChild' | 'children'
> & {
  children: React.ReactNode;
  closeOnPress?: boolean;
};

const DropdownMenuRadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupItem>,
  DropdownMenuRadioGroupItemProps
>(
  (
    {
      children,
      closeOnPress = true,
      disabled = false,
      onPress: onPressProp,
      style,
      ...restProps
    },
    forwardedRef,
  ) => {
    const { color } = useRadioGroup();
    const { onClose } = usePopup();

    const { styles } = useStyles(stylesheet);

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onPressProp?.(e);
        onClose();
      },
      [onPressProp, onClose],
    );

    const itemStyle = React.useCallback(
      (state: PressableStateCallbackType) => {
        return [
          styles.item(state.pressed, color),
          styles.checkboxItem,
          typeof style === 'function' ? style(state) : style,
        ];
      },
      [color, style, styles],
    );

    return (
      <DropdownMenuItemContext.Provider value={{ color, disabled: !!disabled }}>
        <RadioGroupItem
          ref={forwardedRef}
          accessibilityRole="menuitem"
          disabled={disabled}
          onPress={onPress}
          style={itemStyle}
          {...restProps}
        >
          <RadioGroupIndicator />
          {children}
        </RadioGroupItem>
      </DropdownMenuItemContext.Provider>
    );
  },
);

DropdownMenuRadioGroupItem.displayName = 'DropdownMenuRadioGroupItem';

type DropdownMenuCloseProps = PopupCloseProps;

const DropdownMenuClose = PopupClose;

DropdownMenuClose.displayName = 'DropdownMenuClose';

type DropdownMenuSeparatorProps = SeparatorProps;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuSeparatorProps
>(({ style, ...restProps }, forwardedRef) => {
  const { styles } = useStyles(stylesheet);
  return (
    <Separator
      ref={forwardedRef}
      type="hairline"
      orientation="horizontal"
      style={[styles.separator, style]}
      {...restProps}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

type DropdownMenuSubContextValue = {
  id: string;
};

const DropdownMenuSubContext =
  React.createContext<DropdownMenuSubContextValue | null>(null);

const useDropdownMenuSub = () => {
  const ctx = React.useContext(DropdownMenuSubContext);
  if (!ctx) {
    throw new Error(
      'useDropdownMenuSub must be used within a <DropdownMenuSub />',
    );
  }
  return ctx;
};

type DropdownSubMenuProps = {
  children: React.ReactNode;
};

const DropdownMenuSub = ({ children }: DropdownSubMenuProps) => {
  const id = React.useId();
  return (
    <DropdownMenuSubContext.Provider value={{ id }}>
      {children}
    </DropdownMenuSubContext.Provider>
  );
};

DropdownMenuSub.displayName = 'DropdownMenuSub';

type DropdownMenuSubTriggerProps = PressableProps & {
  asChild?: boolean;
};

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuSubTriggerProps
>(({ asChild = false, onPress: onPressProp, ...restProps }, forwardedRef) => {
  const { onSubMenuTriggerPress } = useDropdownMenuContent();
  const { id } = useDropdownMenuSub();

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onSubMenuTriggerPress(id);
      onPressProp?.(e);
    },
    [onPressProp, id, onSubMenuTriggerPress],
  );

  const Comp = asChild ? Slot : Pressable;
  return (
    <>
      <Comp
        ref={forwardedRef}
        accessibilityRole="menuitem"
        onPress={onPress}
        {...restProps}
      />
    </>
  );
});

DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

type DropdownMenuSubContentProps = ViewProps & {
  asChild?: boolean;
};

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof View>,
  DropdownMenuSubContentProps
>(({ asChild = false, children, style, ...restProps }, forwardedRef) => {
  const { addSubMenu } = useDropdownMenuContent();
  const { id } = useDropdownMenuSub();
  const { styles } = useStyles(stylesheet);

  React.useEffect(() => {
    const Comp = asChild ? Slot : View;
    const menu = {
      id,
      Component: () => (
        <Comp
          ref={forwardedRef}
          accessibilityRole="menu"
          style={[styles.menu, style]}
          {...restProps}
        >
          {children}
        </Comp>
      ),
    };
    addSubMenu(menu);
  }, [
    asChild,
    addSubMenu,
    children,
    forwardedRef,
    id,
    restProps,
    style,
    styles.menu,
  ]);
  return null;
});

DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

type DropdownMenuSubBackTriggerProps = PressableProps & {
  asChild?: boolean;
};

const DropdownMenuSubBackTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  DropdownMenuSubBackTriggerProps
>(({ asChild, onPress: onPressProp, ...restProps }, forwardedRef) => {
  const { onSubMenuBackPress } = useDropdownMenuContent();

  const onPress = React.useCallback(
    (e: GestureResponderEvent) => {
      onSubMenuBackPress();
      onPressProp?.(e);
    },
    [onPressProp, onSubMenuBackPress],
  );

  const Comp = asChild ? Slot : Pressable;
  return (
    <Comp
      ref={forwardedRef}
      accessibilityRole="menuitem"
      onPress={onPress}
      {...restProps}
    />
  );
});

DropdownMenuSubBackTrigger.displayName = 'DropdownMenuSubBackTrigger';

const stylesheet = createStyleSheet(({ colors, radius, space }, rt) => ({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.transparent,
  },
  menuContainer: {
    padding: 0,
    backgroundColor: colors.neutral2,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.3,
    shadowRadius: 64,
    elevation: 24,
  },
  menu: {
    paddingVertical: space[8],
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  label: {
    textAlign: 'left',
    paddingHorizontal: space[20],
    paddingVertical: space[8],
  },
  item: (pressed: boolean, color: Color) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[16],
    paddingHorizontal: space[20],
    paddingVertical: space[12],
    backgroundColor: pressed ? colors[`${color}3`] : colors.transparent,
  }),
  endIcon: {
    flexGrow: 1,
    textAlign: 'right',
  },
  checkboxItem: {
    gap: space[12],
  },
  separator: {
    marginVertical: space[8],
  },
}));

const entryAnim = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.5 }],
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
    transform: [{ scale: 0.5 }],
    easing: animConfig.easing,
  },
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuItemIcon,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioGroupItem,
  DropdownMenuClose,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSubBackTrigger,
};
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuLabelProps,
  DropdownMenuItemProps,
  DropdownMenuItemTitleProps,
  DropdownMenuItemIconProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioGroupItemProps,
  DropdownMenuCloseProps,
  DropdownMenuSeparatorProps,
  DropdownSubMenuProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubBackTriggerProps,
};
