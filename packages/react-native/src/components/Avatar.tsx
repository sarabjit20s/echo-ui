import React from 'react';
import {
  Image,
  ImageErrorEventData,
  ImageLoadEventData,
  ImageProps,
  NativeSyntheticEvent,
  View,
  ViewProps,
} from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Slot } from '@/utils/slot';
import { Color } from '@/styles/tokens/colors';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';
type AvatarColor = Color;
type AvatarVariant = 'soft' | 'solid';
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type AvatarContextProps = {
  color: AvatarColor;
  variant: AvatarVariant;
  size: AvatarSize;
  imageLoadingStatus: ImageLoadingStatus;
  setImageLoadingStatus: React.Dispatch<
    React.SetStateAction<ImageLoadingStatus>
  >;
};

const AvatarContext = React.createContext<AvatarContextProps | null>(null);

const useAvatar = () => {
  const ctx = React.useContext(AvatarContext);
  if (!ctx) {
    throw new Error('useAvatar must be used within a <Avatar />');
  }
  return ctx;
};

type AvatarProps = ViewProps & {
  asChild?: boolean;
  children: React.ReactNode;
  color?: AvatarColor;
  variant?: AvatarVariant;
  size?: AvatarSize;
};

const Avatar = React.forwardRef<React.ElementRef<typeof View>, AvatarProps>(
  (
    {
      asChild = false,
      color = 'primary',
      size = 'md',
      variant = 'soft',
      style,
      ...restProps
    }: AvatarProps,
    forwardedRef,
  ) => {
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });
    const [imageLoadingStatus, setImageLoadingStatus] =
      React.useState<ImageLoadingStatus>('idle');

    const Comp = asChild ? Slot : View;
    return (
      <AvatarContext.Provider
        value={{
          color,
          variant,
          size,
          imageLoadingStatus,
          setImageLoadingStatus,
        }}
      >
        <Comp ref={forwardedRef} style={[styles.image, style]} {...restProps} />
      </AvatarContext.Provider>
    );
  },
);

Avatar.displayName = 'Avatar';

type AvatarImageProps = ImageProps & {
  asChild?: boolean;
};

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Image>,
  AvatarImageProps
>(
  (
    {
      asChild = false,
      onError: onErrorProp,
      onLoad: onLoadProp,
      onLoadStart: onLoadStartProp,
      style,
      ...restProps
    }: AvatarImageProps,
    forwardedRef,
  ) => {
    const { setImageLoadingStatus, size, variant } = useAvatar();
    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });

    function onLoadStart() {
      setImageLoadingStatus('loading');
      onLoadStartProp?.();
    }
    function onLoad(e: NativeSyntheticEvent<ImageLoadEventData>) {
      setImageLoadingStatus('loaded');
      onLoadProp?.(e);
    }
    function onError(e: NativeSyntheticEvent<ImageErrorEventData>) {
      setImageLoadingStatus('error');
      onErrorProp?.(e);
    }

    const Comp = asChild ? Slot : Image;

    return (
      <Comp
        ref={forwardedRef}
        onError={onError}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        style={[styles.image, style]}
        {...restProps}
      />
    );
  },
);

AvatarImage.displayName = 'AvatarImage';

type AvatarFallbackProps = ViewProps & {
  asChild?: boolean;
};

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof View>,
  AvatarFallbackProps
>(
  (
    { asChild = false, style, ...restProps }: AvatarFallbackProps,
    forwardedRef,
  ) => {
    const { imageLoadingStatus, color, size, variant } = useAvatar();

    const { styles } = useStyles(stylesheet, {
      size,
      variant,
    });

    const Comp = asChild ? Slot : View;

    return imageLoadingStatus !== 'loaded' ? (
      <Comp
        ref={forwardedRef}
        style={[styles.image, styles.fallback(color), style]}
        {...restProps}
      />
    ) : null;
  },
);

AvatarFallback.displayName = 'AvatarFallback';

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

export { Avatar, AvatarImage, AvatarFallback, useAvatar };
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
