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
export type FontSize =
  | 10
  | 11
  | 12
  | 14
  | 16
  | 18
  | 20
  | 22
  | 25
  | 28
  | 32
  | 36
  | 40
  | 45
  | 51
  | 57
  | 64
  | 72;

type FontSizes = {
  [key in FontSize]: key;
};

export const fontSizes: FontSizes = {
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
} as const;

export const typography = {
  fontFamilies,
  fontSizes,
  textVariants,
} as const;
