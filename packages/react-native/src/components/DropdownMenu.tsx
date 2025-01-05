import * as React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  View,
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
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color } from '@/styles/tokens';

const animConfig = {
  duration: 200,
  easing: Easing.out(Easing.ease),
  reduceMotion: ReduceMotion.System,
} as const;

type DropdownMenuProps = PopupProps;

const DropdownMenu = Popup;

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

type DropdownMenuContentProps<
  T extends React.ElementType = typeof PopupContent,
> = PopupContentProps<T> & {
  showArrow?: boolean;
};

const DropdownMenuContent = genericForwardRef(function DropdownMenuContent<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(props: DropdownMenuContentProps<T>, ref: React.ForwardedRef<View>) {
  const { styles } = useStyles(stylesheet);

  return (
    <PopupPortal>
      <PopupOverlay style={styles.overlay} />
      <DropdownMenuContentImpl ref={ref} {...props} />
    </PopupPortal>
  );
});

const AnimatedPopupContent = Animated.createAnimatedComponent(PopupContent);

type DropdownMenuContentImplProps<
  T extends React.ElementType = typeof PopupContent,
> = DropdownMenuContentProps<T>;

const DropdownMenuContentImpl = genericForwardRef(
  function DropdownMenuContentImpl<
    T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
  >(
    {
      children,
      showArrow = false,
      style,
      ...restProps
    }: DropdownMenuContentImplProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
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
        ref={ref}
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
  },
);

type DropdownMenuLabelProps<T extends React.ElementType = typeof Text> =
  TextProps<T>;

const DropdownMenuLabel = genericForwardRef(function DropdownMenuLabel<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(
  { children, style, ...restProps }: DropdownMenuLabelProps<T>,
  ref: React.ForwardedRef<T>,
) {
  const { styles } = useStyles(stylesheet);
  return (
    <Text
      ref={ref}
      variant="labelSm"
      style={[styles.label, style]}
      {...restProps}
    >
      {children}
    </Text>
  );
});

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

type DropdownMenuItemProps<T extends React.ElementType = typeof Pressable> =
  PolymorphicProps<T> & {
    color?: Color;
    closeOnPress?: boolean;
  };

const DropdownMenuItem = genericForwardRef(function DropdownMenuItem<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Pressable>>,
>(
  {
    as,
    accessibilityState,
    color = 'neutral',
    disabled = false,
    closeOnPress = true,
    onPress: onPressProp,
    style,
    ...restProps
  }: DropdownMenuItemProps<T>,
  ref: React.ForwardedRef<View>,
) {
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

  const Comp = as || Pressable;

  return (
    <DropdownMenuItemContext.Provider value={{ color, disabled: !!disabled }}>
      <Comp
        ref={ref}
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
});

type DropdownMenuItemTitleProps<T extends React.ElementType = typeof Text> =
  TextProps<T>;

const DropdownMenuItemTitle = genericForwardRef(function DropdownMenuItemTitle<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: DropdownMenuItemTitleProps<T>, ref: React.ForwardedRef<T>) {
  const { color, disabled } = useDropdownMenuItem();
  return (
    <Text
      ref={ref}
      variant="bodyMd"
      color={color}
      highContrast={color === 'neutral'}
      disabled={disabled}
      {...props}
    />
  );
});

type DropdownMenuItemIconProps = IconProps & {
  isEndIcon?: boolean;
};

const DropdownMenuItemIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  DropdownMenuItemIconProps
>(function DropdownMenuItemIcon(
  { isEndIcon = false, style, ...restProps },
  ref,
) {
  const { color, disabled } = useDropdownMenuItem();
  const { styles } = useStyles(stylesheet);

  return (
    <Icon
      ref={ref}
      size="lg"
      color={color}
      highContrast={color === 'neutral'}
      disabled={disabled}
      style={[isEndIcon && styles.endIcon, style]}
      {...restProps}
    />
  );
});

type DropdownMenuCheckboxItemProps<
  T extends React.ElementType = typeof Pressable,
> = CheckboxProps<T> & {
  closeOnPress?: boolean;
};

const DropdownMenuCheckboxItem = genericForwardRef(
  function DropdownMenuCheckboxItem<
    T extends React.ElementType<
      React.ComponentPropsWithoutRef<typeof Pressable>
    >,
  >(
    {
      children,
      color = 'neutral',
      closeOnPress = true,
      disabled = false,
      onPress: onPressProp,
      style,
      ...restProps
    }: DropdownMenuCheckboxItemProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
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
          ref={ref}
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
          {(state) => (
            <>
              <CheckboxIndicator />
              {typeof children === 'function' ? children(state) : children}
            </>
          )}
        </Checkbox>
      </DropdownMenuItemContext.Provider>
    );
  },
);

type DropdownMenuRadioGroupProps<
  T extends React.ElementType = typeof RadioGroup,
> = RadioGroupProps<T>;

const DropdownMenuRadioGroup = genericForwardRef(
  function DropdownMenuRadioGroup<
    T extends React.ElementType<
      React.ComponentPropsWithoutRef<typeof RadioGroup>
    >,
  >(
    {
      color = 'neutral',
      disabled = false,
      ...restProps
    }: DropdownMenuRadioGroupProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
    return (
      <RadioGroup
        ref={ref}
        color={color}
        size="md"
        variant="ghost"
        highContrast={color === 'neutral'}
        disabled={disabled}
        {...restProps}
      />
    );
  },
);

type DropdownMenuRadioGroupItemProps<
  T extends React.ElementType = typeof RadioGroupItem,
> = RadioGroupItemProps<T> & {
  closeOnPress?: boolean;
};

const DropdownMenuRadioGroupItem = genericForwardRef(
  function DropdownMenuRadioGroupItem<
    T extends React.ElementType<
      React.ComponentPropsWithoutRef<typeof RadioGroupItem>
    >,
  >(
    {
      children,
      closeOnPress = true,
      disabled = false,
      onPress: onPressProp,
      style,
      ...restProps
    }: DropdownMenuRadioGroupItemProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
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
          ref={ref}
          accessibilityRole="menuitem"
          disabled={disabled}
          onPress={onPress}
          style={itemStyle}
          {...restProps}
        >
          {(state) => (
            <>
              <RadioGroupIndicator />
              {typeof children === 'function' ? children(state) : children}
            </>
          )}
        </RadioGroupItem>
      </DropdownMenuItemContext.Provider>
    );
  },
);

type DropdownMenuCloseProps = PopupCloseProps;

const DropdownMenuClose = PopupClose;

type DropdownMenuSeparatorProps<
  T extends React.ElementType = typeof Separator,
> = SeparatorProps<T>;

const DropdownMenuSeparator = genericForwardRef(function DropdownMenuSeparator<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Separator>>,
>(
  { style, ...restProps }: DropdownMenuSeparatorProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet);
  return (
    <Separator
      ref={ref}
      type="hairline"
      orientation="horizontal"
      style={[styles.separator, style]}
      {...restProps}
    />
  );
});

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

type DropdownMenuSubProps = {
  children: React.ReactNode;
};

const DropdownMenuSub = ({ children }: DropdownMenuSubProps) => {
  return (
    <DropdownMenuSubContext.Provider value={{ id: React.useId() }}>
      {children}
    </DropdownMenuSubContext.Provider>
  );
};

type DropdownMenuSubTriggerProps<
  T extends React.ElementType = typeof Pressable,
> = PolymorphicProps<T>;

const DropdownMenuSubTrigger = genericForwardRef(
  function DropdownMenuSubTrigger<
    T extends React.ElementType<
      React.ComponentPropsWithoutRef<typeof Pressable>
    >,
  >(
    { as, onPress: onPressProp, ...restProps }: DropdownMenuSubTriggerProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
    const { onSubMenuTriggerPress } = useDropdownMenuContent();
    const { id } = useDropdownMenuSub();

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onSubMenuTriggerPress(id);
        onPressProp?.(e);
      },
      [onPressProp, id, onSubMenuTriggerPress],
    );

    const Comp = as || Pressable;
    return (
      <>
        <Comp
          ref={ref}
          accessibilityRole="menuitem"
          onPress={onPress}
          {...restProps}
        />
      </>
    );
  },
);

type DropdownMenuSubContentProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T>;

const DropdownMenuSubContent = genericForwardRef(
  function DropdownMenuSubContent<
    T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
  >(
    { as, children, style, ...restProps }: DropdownMenuSubContentProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
    const { addSubMenu } = useDropdownMenuContent();
    const { id } = useDropdownMenuSub();
    const { styles } = useStyles(stylesheet);

    React.useEffect(() => {
      const Comp = as || View;
      const menu = {
        id,
        Component: () => (
          <Comp
            ref={ref}
            accessibilityRole="menu"
            style={[styles.menu, style]}
            {...restProps}
          >
            {children}
          </Comp>
        ),
      };
      addSubMenu(menu);
    }, [as, addSubMenu, children, ref, id, restProps, style, styles.menu]);
    return null;
  },
);

type DropdownMenuSubBackTriggerProps<
  T extends React.ElementType = typeof Pressable,
> = PolymorphicProps<T>;

const DropdownMenuSubBackTrigger = genericForwardRef(
  function DropdownMenuSubBackTrigger<
    T extends React.ElementType<
      React.ComponentPropsWithoutRef<typeof Pressable>
    >,
  >(
    {
      as,
      onPress: onPressProp,
      ...restProps
    }: DropdownMenuSubBackTriggerProps<T>,
    ref: React.ForwardedRef<View>,
  ) {
    const { onSubMenuBackPress } = useDropdownMenuContent();

    const onPress = React.useCallback(
      (e: GestureResponderEvent) => {
        onSubMenuBackPress();
        onPressProp?.(e);
      },
      [onPressProp, onSubMenuBackPress],
    );

    const Comp = as || Pressable;
    return (
      <Comp
        ref={ref}
        accessibilityRole="menuitem"
        onPress={onPress}
        {...restProps}
      />
    );
  },
);

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
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 64,
    elevation: 64,
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
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubBackTriggerProps,
};
