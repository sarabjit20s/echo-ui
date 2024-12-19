import { lightThemeColors, darkThemeColors } from './tokens/colors';
import { radius } from './tokens/radius';
import { space } from './tokens/space';
import { typography } from './tokens/typography';

export const lightTheme = {
  colors: lightThemeColors,
  radius,
  space,
  typography,
} as const;

export const darkTheme = {
  colors: darkThemeColors,
  radius,
  space,
  typography,
} as const;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// every theme should have a same structure as lightTheme
export type Theme = typeof lightTheme;
export type Themes = typeof themes;
