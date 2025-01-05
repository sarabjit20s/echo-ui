import * as React from 'react';
import {
  Image,
  ImageErrorEventData,
  ImageLoadEventData,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text, TextProps } from './Text';
import { Icon, IconProps } from './Icon';
import { genericForwardRef } from '@/utils/genericForwardRef';
import type { PolymorphicProps } from '@/types/components';
import type { Color, ColorStep } from '@/styles/tokens';

type AvatarColor = Color;
type AvatarVariant = 'soft' | 'solid';
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

type AvatarContextValue = {
  color: AvatarColor;
  variant: AvatarVariant;
  size: AvatarSize;
  imageLoadingStatus: ImageLoadingStatus;
  onLoadingStatusChange: (status: ImageLoadingStatus) => void;
};

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

const useAvatar = () => {
  const ctx = React.useContext(AvatarContext);
  if (!ctx) {
    throw new Error('useAvatar must be used within a <Avatar />');
  }
  return ctx;
};

type AvatarProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    color?: AvatarColor;
    variant?: AvatarVariant;
    size?: AvatarSize;
  };

const Avatar = genericForwardRef(function Avatar<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  {
    as,
    color = 'primary',
    size = 'md',
    variant = 'soft',
    style,
    ...restProps
  }: AvatarProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const [imageLoadingStatus, setImageLoadingStatus] =
    React.useState<ImageLoadingStatus>('idle');

  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  const onLoadingStatusChange = React.useCallback(
    (status: ImageLoadingStatus) => {
      setImageLoadingStatus(status);
    },
    [],
  );

  const Comp = as || View;

  return (
    <AvatarContext.Provider
      value={{
        color,
        variant,
        size,
        imageLoadingStatus,
        onLoadingStatusChange,
      }}
    >
      <Comp ref={ref} style={[styles.image, style]} {...restProps} />
    </AvatarContext.Provider>
  );
});

type AvatarImageProps<T extends React.ElementType = typeof Image> =
  PolymorphicProps<T>;

const AvatarImage = genericForwardRef(function AvatarImage<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Image>>,
>(
  {
    as,
    onError: onErrorProp,
    onLoad: onLoadProp,
    onLoadStart: onLoadStartProp,
    style,
    ...restProps
  }: AvatarImageProps<T>,
  ref: React.ForwardedRef<Image>,
) {
  const { onLoadingStatusChange, size, variant } = useAvatar();

  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  React.useEffect(() => {
    return () => {
      onLoadingStatusChange('idle');
    };
  }, [onLoadingStatusChange]);

  const onLoadStart = React.useCallback(() => {
    onLoadingStatusChange('loading');
    onLoadStartProp?.();
  }, [onLoadStartProp, onLoadingStatusChange]);

  const onLoad = React.useCallback(
    (e: NativeSyntheticEvent<ImageLoadEventData>) => {
      onLoadingStatusChange('loaded');
      onLoadProp?.(e);
    },
    [onLoadProp, onLoadingStatusChange],
  );

  const onError = React.useCallback(
    (e: NativeSyntheticEvent<ImageErrorEventData>) => {
      onLoadingStatusChange('error');
      onErrorProp?.(e);
    },
    [onErrorProp, onLoadingStatusChange],
  );

  const Comp = as || Image;

  return (
    <Comp
      ref={ref}
      onError={onError}
      onLoad={onLoad}
      onLoadStart={onLoadStart}
      style={[styles.image, style]}
      {...restProps}
    />
  );
});

type AvatarFallbackProps<T extends React.ElementType = typeof View> =
  PolymorphicProps<T> & {
    delayMs?: number;
  };

const AvatarFallback = genericForwardRef(function AvatarFallback<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof View>>,
>(
  { as, delayMs, style, ...restProps }: AvatarFallbackProps<T>,
  ref: React.ForwardedRef<View>,
) {
  const { imageLoadingStatus, color, size, variant } = useAvatar();

  const [canRender, setCanRender] = React.useState(delayMs === undefined);

  const { styles } = useStyles(stylesheet, {
    size,
    variant,
  });

  React.useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    if (delayMs !== undefined) {
      timerId = setTimeout(() => setCanRender(true), delayMs);
    }
    return () => clearTimeout(timerId);
  }, [delayMs]);

  const Comp = as || View;

  return canRender && imageLoadingStatus !== 'loaded' ? (
    <Comp
      ref={ref}
      style={[styles.image, styles.fallback(color), style]}
      {...restProps}
    />
  ) : null;
});

const textVariantsMap: Record<AvatarSize, TextProps['variant']> = {
  xs: 'labelXs',
  sm: 'labelSm',
  md: 'labelSm',
  lg: 'headingXs',
  xl: 'headingSm',
  '2xl': 'headingMd',
};

type AvatarTextProps<T extends React.ElementType = typeof Text> = TextProps<T>;

const AvatarText = genericForwardRef(function AvatarText<
  T extends React.ElementType<React.ComponentPropsWithoutRef<typeof Text>>,
>(props: AvatarTextProps<T>, ref: React.ForwardedRef<T>) {
  const { color, size, variant } = useAvatar();

  const colorStep: ColorStep = variant === 'solid' ? 'Contrast' : '11';

  return (
    <Text
      ref={ref}
      color={color}
      colorStep={colorStep}
      variant={textVariantsMap[size]}
      {...props}
    />
  );
});

const iconSizeMap: Record<AvatarSize, IconProps['size']> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'xl',
  xl: '3xl',
  '2xl': '5xl',
};

type AvatarIconProps = IconProps;

const AvatarIcon = React.forwardRef<
  React.ElementRef<typeof Icon>,
  AvatarIconProps
>((props: AvatarIconProps, forwardedRef) => {
  const { color, size, variant } = useAvatar();

  const colorStep: ColorStep = variant === 'solid' ? 'Contrast' : '11';

  return (
    <Icon
      ref={forwardedRef}
      color={color}
      colorStep={colorStep}
      size={iconSizeMap[size]}
      {...props}
    />
  );
});

AvatarIcon.displayName = 'AvatarIcon';

const stylesheet = createStyleSheet(({ colors, radius }) => ({
  image: {
    position: 'relative',
    borderRadius: radius.full,
    overflow: 'hidden',
    variants: {
      size: {
        xs: {
          width: 28,
          height: 28,
        },
        sm: {
          width: 36,
          height: 36,
        },
        md: {
          width: 44,
          height: 44,
        },
        lg: {
          width: 52,
          height: 52,
        },
        xl: {
          width: 64,
          height: 64,
        },
        '2xl': {
          width: 80,
          height: 80,
        },
      },
    },
  },
  fallback: (color: Color) => ({
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    variants: {
      variant: {
        soft: {
          backgroundColor: colors[`${color}3`],
        },
        solid: {
          backgroundColor: colors[`${color}9`],
        },
      },
    },
  }),
}));

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarText,
  AvatarIcon,
  useAvatar,
};
export type {
  AvatarProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarTextProps,
  AvatarIconProps,
};
