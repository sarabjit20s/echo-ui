import * as React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text, TextProps } from './Text';
import { Icon, IconProps } from './Icon';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color } from '@/styles/tokens';

type AlertColor = Color;
type AlertSize = 'sm' | 'md' | 'lg';
type AlertVariant = 'soft' | 'outline';

type AlertContextValue = {
  color: AlertColor;
  size: AlertSize;
  variant: AlertVariant;
  highContrast: boolean;
};

const AlertContext = React.createContext<AlertContextValue | null>(null);

const useAlert = () => {
  const ctx = React.useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within a <Alert />');
  }
  return ctx;
};

type AlertProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    highContrast?: boolean;
    size?: AlertSize;
    variant?: AlertVariant;
    color?: AlertColor;
  };

const Alert = genericForwardRef(function Alert<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    color = 'primary',
    size = 'md',
    variant = 'soft',
    highContrast = false,
    style,
    ...restProps
  }: AlertProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  const Comp = as || View;

  return (
    <AlertContext.Provider value={{ color, highContrast, size, variant }}>
      <Comp
        ref={ref}
        accessibilityRole="alert"
        style={[styles.alert(color), style]}
        {...restProps}
      />
    </AlertContext.Provider>
  );
});

const titleVariantMap: Record<AlertSize, TextProps['variant']> = {
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelLg',
};

type AlertTitleProps<T extends React.ElementType = typeof Text> = TextProps<T>;

const AlertTitle = genericForwardRef(function AlertTitle<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: AlertTitleProps<T>, ref: React.ForwardedRef<T>) {
  const { color, highContrast, size } = useAlert();
  return (
    <Text
      ref={ref}
      color={color}
      variant={titleVariantMap[size]}
      highContrast={highContrast}
      {...props}
    />
  );
});

const descriptionVariantMap: Record<AlertSize, TextProps['variant']> = {
  sm: 'bodyXs',
  md: 'bodySm',
  lg: 'bodyMd',
};

type AlertDescriptionProps<T extends React.ElementType = typeof Text> =
  TextProps<T>;

const AlertDescription = genericForwardRef(function AlertDescription<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: AlertDescriptionProps<T>, ref: React.ForwardedRef<T>) {
  const { color, highContrast, size } = useAlert();

  return (
    <Text
      ref={ref}
      color={color}
      variant={descriptionVariantMap[size]}
      highContrast={highContrast}
      {...props}
    />
  );
});

type AlertIconProps = IconProps;

const iconSizeMap: Record<AlertSize, IconProps['size']> = {
  sm: '2xl',
  md: '3xl',
  lg: '4xl',
};

const AlertIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  AlertIconProps
>(function AlertIcon(props: AlertIconProps, ref) {
  const { color, highContrast, size } = useAlert();
  return (
    <Icon
      ref={ref}
      color={color}
      size={iconSizeMap[size]}
      highContrast={highContrast}
      {...props}
    />
  );
});

const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
  alert: (color: Color) => ({
    width: '100%',
    borderCurve: 'continuous',
    variants: {
      size: {
        sm: {
          gap: space[4],
          padding: space[16],
          borderRadius: radius.md,
        },
        md: {
          gap: space[8],
          padding: space[20],
          borderRadius: radius.lg,
        },
        lg: {
          gap: space[12],
          padding: space[24],
          borderRadius: radius.lg,
        },
      },
      variant: {
        soft: {
          backgroundColor: colors[`${color}3`],
        },
        outline: {
          backgroundColor: colors.transparent,
          borderWidth: 1,
          borderColor: colors[`${color}7`],
        },
      },
    },
  }),
}));

export { Alert, AlertTitle, AlertIcon, AlertDescription, useAlert };
export type {
  AlertProps,
  AlertTitleProps,
  AlertIconProps,
  AlertDescriptionProps,
};
