import React from 'react';
import { View, ViewProps } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text, TextProps } from './Text';
import { Icon, IconProps } from './Icon';
import { Slot } from '@/utils/slot';
import { Color } from '@/styles/tokens/colors';

type AlertSize = 'sm' | 'md' | 'lg';
type AlertVariant = 'soft' | 'outline';

type AlertContextProps = {
  color: Color;
  size: AlertSize;
  variant: AlertVariant;
  highContrast: boolean;
};

const AlertContext = React.createContext<AlertContextProps | undefined>(
  undefined,
);

const useAlert = () => {
  const ctx = React.useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within a <Alert />');
  }
  return ctx;
};

type AlertProps = ViewProps & {
  asChild?: boolean;
  color?: Color;
  highContrast?: boolean;
  size?: AlertSize;
  variant?: AlertVariant;
};

const Alert = React.forwardRef<React.ElementRef<typeof View>, AlertProps>(
  (
    {
      asChild = false,
      color = 'primary',
      size = 'md',
      variant = 'soft',
      highContrast = false,
      style,
      ...restProps
    }: AlertProps,
    forwardedRef,
  ) => {
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });

    const Comp = asChild ? Slot : View;
    return (
      <AlertContext.Provider value={{ color, highContrast, size, variant }}>
        <Comp
          ref={forwardedRef}
          accessibilityRole="alert"
          style={[styles.alert(color), style]}
          {...restProps}
        />
      </AlertContext.Provider>
    );
  },
);

Alert.displayName = 'Alert';

type AlertTitleProps = TextProps;

const titleVariantMap: Record<AlertSize, TextProps['variant']> = {
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelLg',
};

const AlertTitle = React.forwardRef<
  React.ElementRef<typeof Text>,
  AlertTitleProps
>((props: AlertTitleProps, forwardedRef) => {
  const { color, highContrast, size } = useAlert();
  return (
    <Text
      ref={forwardedRef}
      color={color}
      variant={titleVariantMap[size]}
      highContrast={highContrast}
      {...props}
    />
  );
});

AlertTitle.displayName = 'AlertTitle';

type AlertDescriptionProps = TextProps;

const descriptionVariantMap: Record<AlertSize, TextProps['variant']> = {
  sm: 'bodyXs',
  md: 'bodySm',
  lg: 'bodyMd',
};

const AlertDescription = React.forwardRef<
  React.ElementRef<typeof Text>,
  AlertDescriptionProps
>(({ ...restProps }: AlertDescriptionProps, forwardedRef) => {
  const { color, highContrast, size } = useAlert();

  return (
    <Text
      ref={forwardedRef}
      color={color}
      variant={descriptionVariantMap[size]}
      highContrast={highContrast}
      {...restProps}
    />
  );
});

AlertDescription.displayName = 'AlertDescription';

type AlertIconProps = IconProps;

const iconSizeMap: Record<AlertSize, IconProps['size']> = {
  sm: '2xl',
  md: '3xl',
  lg: '4xl',
};

const AlertIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  AlertIconProps
>(({ ...restProps }: AlertIconProps, forwardedRef) => {
  const { color, highContrast, size } = useAlert();
  return (
    <Icon
      ref={forwardedRef}
      color={color}
      size={iconSizeMap[size]}
      highContrast={highContrast}
      {...restProps}
    />
  );
});

AlertIcon.displayName = 'AlertIcon';

export const stylesheet = createStyleSheet(({ colors, radius, space }) => ({
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
          borderRadius: radius.xl,
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
