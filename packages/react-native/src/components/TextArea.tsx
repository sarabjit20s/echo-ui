import * as React from 'react';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import type { Color } from '@/styles/tokens/colors';

type TextAreaProps = RNTextInputProps & {
  color?: Color;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'soft';
};

const TextArea = React.forwardRef<
  React.ElementRef<typeof RNTextInput>,
  TextAreaProps
>(function TextArea(
  {
    cursorColor,
    multiline = true,
    placeholderTextColor,
    selectionColor,
    color = 'primary',
    size = 'md',
    variant = 'outline',
    textAlignVertical = 'top',
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    style,
    ...restProps
  }: TextAreaProps,
  ref,
) {
  const [focused, setFocused] = React.useState<boolean>(false);

  const { styles, theme } = useStyles(stylesheet, {
    size,
    variant,
  });

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
    <RNTextInput
      ref={ref}
      cursorColor={cursorColor || theme.colors[`${color}8`]}
      placeholderTextColor={placeholderTextColor || theme.colors.neutral10}
      selectionColor={selectionColor || theme.colors[`${color}8`]}
      multiline={multiline}
      textAlignVertical={textAlignVertical}
      onBlur={onBlur}
      onFocus={onFocus}
      style={[styles.textArea(color, focused), style]}
      {...restProps}
    />
  );
});

const stylesheet = createStyleSheet(
  ({ colors, radius, space, typography }) => ({
    textArea: (color: Color, focused: boolean) => ({
      width: '100%',
      flexDirection: 'row',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      fontFamily: typography.fontFamilies.interRegular,
      variants: {
        size: {
          sm: {
            height: 64,
            fontSize: typography.fontSizes[14],
            padding: space[10],
          },
          md: {
            height: 96,
            fontSize: typography.fontSizes[16],
            padding: space[12],
          },
          lg: {
            height: 128,
            fontSize: typography.fontSizes[18],
            padding: space[16],
          },
        },
        variant: {
          outline: {
            borderWidth: 1,
            borderColor: focused ? colors[`${color}8`] : colors.neutral7,
            backgroundColor: colors.transparent,
            color: colors.neutral12,
          },
          soft: {
            backgroundColor: colors[`${color}3`],
            color: colors[`${color}12`],
          },
          ghost: {
            backgroundColor: colors.transparent,
            color: colors.neutral12,
          },
        },
      },
    }),
  }),
);

export { TextArea };
export type { TextAreaProps };
