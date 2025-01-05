// Colors
import {
  blackA,
  whiteA,
  gray,
  grayDark,
  red as radixRed,
  redDark as radixRedDark,
  green as radixGreen,
  greenDark as radixGreenDark,
} from '@radix-ui/colors';

const primary = {
  primary1: '#fcfdfe',
  primary2: '#f6f9ff',
  primary3: '#ecf2ff',
  primary4: '#ddeaff',
  primary5: '#cddfff',
  primary6: '#b9d2ff',
  primary7: '#a2bfff',
  primary8: '#81a5f9',
  primary9: '#3a6af8',
  primary10: '#345fde',
  primary11: '#305ad8',
  primary12: '#192d63',

  primaryContrast: '#fff',
} as const;

const primaryDark = {
  primary1: '#0c111c',
  primary2: '#111725',
  primary3: '#172448',
  primary4: '#1d2e61',
  primary5: '#243974',
  primary6: '#2d4484',
  primary7: '#375098',
  primary8: '#405eb2',
  primary9: '#3d63dd',
  primary10: '#3f5cb0',
  primary11: '#93b4ff',
  primary12: '#d5e2ff',

  primaryContrast: '#fff',
} as const;

const neutral = {
  neutral1: gray.gray1,
  neutral2: gray.gray2,
  neutral3: gray.gray3,
  neutral4: gray.gray4,
  neutral5: gray.gray5,
  neutral6: gray.gray6,
  neutral7: gray.gray7,
  neutral8: gray.gray8,
  neutral9: gray.gray9,
  neutral10: gray.gray10,
  neutral11: gray.gray11,
  neutral12: gray.gray12,

  neutralContrast: '#fff',
} as const;

const neutralDark = {
  neutral1: grayDark.gray1,
  neutral2: grayDark.gray2,
  neutral3: grayDark.gray3,
  neutral4: grayDark.gray4,
  neutral5: grayDark.gray5,
  neutral6: grayDark.gray6,
  neutral7: grayDark.gray7,
  neutral8: grayDark.gray8,
  neutral9: grayDark.gray9,
  neutral10: grayDark.gray10,
  neutral11: grayDark.gray11,
  neutral12: grayDark.gray12,

  neutralContrast: '#fff',
} as const;

const red = {
  ...radixRed,

  redContrast: '#fff',
} as const;

const redDark = {
  ...radixRedDark,

  redContrast: '#fff',
} as const;

const green = {
  ...radixGreen,

  greenContrast: '#fff',
} as const;

const greenDark = {
  ...radixGreenDark,

  greenContrast: '#fff',
} as const;

const commonColors = {
  white: '#fff',
  black: '#000',
  transparent: 'transparent',
  ...blackA,
  ...whiteA,
} as const;

export const lightThemeColors = {
  ...commonColors,
  ...primary,
  ...neutral,
  ...red,
  ...green,

  foreground: '#000',
  background: '#fff',
  overlay: blackA.blackA6,
  overlayMuted: blackA.blackA3,
  shadow: blackA.blackA7,
} as const;

export const darkThemeColors = {
  ...commonColors,
  ...primaryDark,
  ...neutralDark,
  ...redDark,
  ...greenDark,

  foreground: '#fff',
  background: '#020202',
  overlay: blackA.blackA8,
  overlayMuted: blackA.blackA6,
  shadow: blackA.blackA11,
} as const;

export type Color = 'primary' | 'neutral' | 'red' | 'green';
export type ColorStep =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | 'Contrast';

// Breakpoints
export const breakpoints = {
  mobile: 0,
  tablet: 768,
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type Breakpoints = typeof breakpoints;

// Radius
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type Radius = keyof typeof radius;

// Space
export const space = {
  0: 0,
  1: 1,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  36: 36,
  40: 40,
  44: 44,
  48: 48,
  56: 56,
  64: 64,
  80: 80,
  96: 96,
  112: 112,
  128: 128,
  144: 144,
} as const;

export type Space = keyof typeof space;

// Typography
// font name should be the same as the file name
export type FontFamily =
  | 'Inter-Regular'
  | 'Inter-Medium'
  | 'Inter-SemiBold'
  | 'Inter-Bold'
  | 'InterDisplay-ExtraBold';

export const fontFamilies = {
  interRegular: 'Inter-Regular',
  interMedium: 'Inter-Medium',
  interSemiBold: 'Inter-SemiBold',
  interBold: 'Inter-Bold',
  interDisplayExtraBold: 'InterDisplay-ExtraBold',
} as const;

// Using the `Major Second` type scale (1.125)
// Base font size: 16px
export const fontSizes = {
  10: 10,
  11: 11,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  25: 25,
  28: 28,
  32: 32,
  36: 36,
  40: 40,
  45: 45,
  51: 51,
  57: 57,
  64: 64,
  72: 72,
} as const;

export type FontSize = keyof typeof fontSizes;

export type TextVariant = {
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineHeight: number;
};

export type TextVariants = {
  displayLg: TextVariant;
  displayMd: TextVariant;
  displaySm: TextVariant;
  displayXs: TextVariant;
  headingLg: TextVariant;
  headingMd: TextVariant;
  headingSm: TextVariant;
  headingXs: TextVariant;
  labelLg: TextVariant;
  labelMd: TextVariant;
  labelSm: TextVariant;
  labelXs: TextVariant;
  bodyLg: TextVariant;
  bodyMd: TextVariant;
  bodySm: TextVariant;
  bodyXs: TextVariant;
};

export const textVariants: TextVariants = {
  displayLg: {
    fontFamily: fontFamilies.interDisplayExtraBold,
    fontSize: fontSizes[72],
    lineHeight: 81,
  },
  displayMd: {
    fontFamily: fontFamilies.interDisplayExtraBold,
    fontSize: fontSizes[57],
    lineHeight: 64,
  },
  displaySm: {
    fontFamily: fontFamilies.interDisplayExtraBold,
    fontSize: fontSizes[51],
    lineHeight: 57,
  },
  displayXs: {
    fontFamily: fontFamilies.interDisplayExtraBold,
    fontSize: fontSizes[45],
    lineHeight: 51,
  },
  headingLg: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: fontSizes[40],
    lineHeight: 50,
  },
  headingMd: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: fontSizes[28],
    lineHeight: 35,
  },
  headingSm: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: fontSizes[22],
    lineHeight: 28,
  },
  headingXs: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: fontSizes[18],
    lineHeight: 23,
  },
  labelLg: {
    fontFamily: fontFamilies.interMedium,
    fontSize: fontSizes[18],
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: fontFamilies.interMedium,
    fontSize: fontSizes[16],
    lineHeight: 22,
  },
  labelSm: {
    fontFamily: fontFamilies.interMedium,
    fontSize: fontSizes[14],
    lineHeight: 19,
  },
  labelXs: {
    fontFamily: fontFamilies.interMedium,
    fontSize: fontSizes[12],
    lineHeight: 16,
  },
  bodyLg: {
    fontFamily: fontFamilies.interRegular,
    fontSize: fontSizes[18],
    lineHeight: 27,
  },
  bodyMd: {
    fontFamily: fontFamilies.interRegular,
    fontSize: fontSizes[16],
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fontFamilies.interRegular,
    fontSize: fontSizes[14],
    lineHeight: 21,
  },
  bodyXs: {
    fontFamily: fontFamilies.interRegular,
    fontSize: fontSizes[12],
    lineHeight: 18,
  },
};

export const typography = {
  fontFamilies,
  fontSizes,
  textVariants,
} as const;
