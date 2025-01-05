import {
  lightThemeColors,
  darkThemeColors,
  radius,
  space,
  typography,
} from './tokens';

export type Theme = {
  colors: Record<keyof typeof lightThemeColors, string>;
  radius: typeof radius;
  space: typeof space;
  typography: typeof typography;
};

export const lightTheme: Theme = {
  colors: lightThemeColors,
  radius,
  space,
  typography,
} as const;

export const darkTheme: Theme = {
  colors: darkThemeColors,
  radius,
  space,
  typography,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type Themes = typeof themes;
