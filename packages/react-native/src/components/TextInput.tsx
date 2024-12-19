import React from 'react';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
  View,
  ViewProps,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Slot } from '@/utils/slot';
import { Color } from '@/styles/tokens/colors';

type TextInputContextValue = {
  size: 'sm' | 'md' | 'lg';
  variant: 'ghost' | 'outline' | 'soft';
};

const TextInputContext = React.createContext<TextInputContextValue | null>(
  null,
);

const useTextInput = () => {
  const ctx = React.useContext(TextInputContext);
  if (!ctx) {
    throw new Error('useTextInput must be used within a <TextInput />');
  }
  return ctx;
};

type TextInputProps = Omit<RNTextInputProps, 'style'> & {
  color?: Color;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'soft';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerStyle?: ViewProps['style'];
  textInputStyle?: RNTextInputProps['style'];
};

const TextInput = React.forwardRef<
  React.ElementRef<typeof RNTextInput>,
  TextInputProps
>(
  (
    {
      color = 'primary',
      size = 'md',
      variant = 'outline',
      cursorColor,
      placeholderTextColor,
      selectionColor,
      startAdornment,
      endAdornment,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
      textInputStyle: textInputStyleProp,
      containerStyle,
      ...restProps
    }: TextInputProps,
    forwardedRef,
  ) => {
    const [focused, setFocused] = React.useState(false);

    const { styles, theme } = useStyles(stylesheet, {
      size,
      variant,
    });

    const hasStartAdornment = !!startAdornment;
    const hasEndAdornment = !!endAdornment;

    const textInputStyle = React.useMemo(() => {
      return styles.textInput(
        color,
        hasStartAdornment && hasEndAdornment
          ? 'none'
          : hasStartAdornment
            ? 'paddingEnd'
            : hasEndAdornment
              ? 'paddingStart'
              : 'paddingHorizontal',
      );
    }, [color, hasEndAdornment, hasStartAdornment, styles]);

    const onFocus = React.useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(true);
        onFocusProp?.(e);
      },
      [onFocusProp],
    );
    const onBlur = React.useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setFocused(false);
        onBlurProp?.(e);
      },
      [onBlurProp],
    );

    return (
      <TextInputContext.Provider value={{ size, variant }}>
        <View style={[styles.container(color, focused), containerStyle]}>
          {startAdornment}
          <RNTextInput
            ref={forwardedRef}
            cursorColor={cursorColor || theme.colors[`${color}8`]}
            placeholderTextColor={
              placeholderTextColor || theme.colors.neutral10
            }
            selectionColor={selectionColor || theme.colors[`${color}8`]}
            onBlur={onBlur}
            onFocus={onFocus}
            style={[textInputStyle, textInputStyleProp]}
            {...restProps}
          />
          {endAdornment}
        </View>
      </TextInputContext.Provider>
    );
  },
);

TextInput.displayName = 'TextInput';

type TextInputAdornmentProps = ViewProps & {
  asChild?: boolean;
  type?: 'action' | 'simple';
};

const TextInputAdornment = React.forwardRef<
  React.ElementRef<typeof View>,
  TextInputAdornmentProps
>(
  (
    {
      asChild = false,
      type = 'simple',
      style,
      ...restProps
    }: TextInputAdornmentProps,
    forwardedRef,
  ) => {
    const { size, variant } = useTextInput();
    const { styles } = useStyles(stylesheet, { size, variant });

    const Comp = asChild ? Slot : View;

    return (
      <Comp
        ref={forwardedRef}
        style={[
          type === 'action'
            ? styles.actionAdornmentContainer
            : styles.simpleAdornmentContainer,
          style,
        ]}
        {...restProps}
      />
    );
  },
);

TextInputAdornment.displayName = 'TextInputAdornment';

const stylesheet = createStyleSheet(
  ({ colors, radius, space, typography }) => ({
    container: (color: Color, focused: boolean) => ({
      width: '100%',
      flexDirection: 'row',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      variants: {
        size: {
          sm: {
            height: 36,
          },
          md: {
            height: 44,
          },
          lg: {
            height: 52,
          },
        },
        variant: {
          outline: {
            borderWidth: 1,
            borderColor: focused ? colors[`${color}8`] : colors.neutral7,
            backgroundColor: colors.transparent,
          },
          soft: {
            backgroundColor: colors[`${color}3`],
          },
          ghost: {
            backgroundColor: colors.transparent,
          },
        },
      },
    }),
    textInput: (
      color: Color,
      paddingKey: 'paddingEnd' | 'paddingHorizontal' | 'paddingStart' | 'none',
    ) => ({
      width: '100%',
      flexShrink: 1,
      fontFamily: typography.fontFamilies.interRegular,
      variants: {
        size: {
          sm: {
            fontSize: typography.fontSizes[14],
            [paddingKey]: space[8],
          },
          md: {
            fontSize: typography.fontSizes[16],
            [paddingKey]: space[12],
          },
          lg: {
            fontSize: typography.fontSizes[18],
            [paddingKey]: space[16],
          },
        },
        variant: {
          outline: {
            color: colors.neutral12,
          },
          soft: {
            color: colors[`${color}12`],
          },
          ghost: {
            color: colors.neutral12,
          },
        },
      },
    }),
    simpleAdornmentContainer: {
      justifyContent: 'center',
      variants: {
        size: {
          sm: {
            paddingHorizontal: space[10],
          },
          md: {
            paddingHorizontal: space[12],
          },
          lg: {
            paddingHorizontal: space[16],
          },
        },
      },
    },
    actionAdornmentContainer: {
      justifyContent: 'center',
      paddingHorizontal: space[4],
    },
  }),
);

export { TextInput, TextInputAdornment, useTextInput };
export type { TextInputProps, TextInputAdornmentProps };
