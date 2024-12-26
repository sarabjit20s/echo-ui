import {
  blackA,
  whiteA,
  gray,
  grayA,
  grayDark,
  grayDarkA,
  red as radixRed,
  redA,
  redDark as radixRedDark,
  redDarkA,
  green as radixGreen,
  greenA,
  greenDark as radixGreenDark,
  greenDarkA,
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

  primaryA1: '#0055aa03',
  primaryA2: '#0055ff09',
  primaryA3: '#0051ff13',
  primaryA4: '#0062ff22',
  primaryA5: '#005cff32',
  primaryA6: '#005cff46',
  primaryA7: '#0050ff5d',
  primaryA8: '#0049f37e',
  primaryA9: '#003ef6c5',
  primaryA10: '#0036d6cb',
  primaryA11: '#0034cfcf',
  primaryA12: '#001652e6',

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

  primaryA1: '#0012fb0c',
  primaryA2: '#1156f916',
  primaryA3: '#2b64ff3b',
  primaryA4: '#3567ff56',
  primaryA5: '#3f71fd6b',
  primaryA6: '#4b7afd7c',
  primaryA7: '#5480ff91',
  primaryA8: '#5783ffad',
  primaryA9: '#4571ffdb',
  primaryA10: '#5580feab',
  primaryA11: '#93b4ff',
  primaryA12: '#d5e2ff',

  primaryContrast: '#fff',
};

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

  neutralA1: grayA.grayA1,
  neutralA2: grayA.grayA2,
  neutralA3: grayA.grayA3,
  neutralA4: grayA.grayA4,
  neutralA5: grayA.grayA5,
  neutralA6: grayA.grayA6,
  neutralA7: grayA.grayA7,
  neutralA8: grayA.grayA8,
  neutralA9: grayA.grayA9,
  neutralA10: grayA.grayA10,
  neutralA11: grayA.grayA11,
  neutralA12: grayA.grayA12,

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

  neutralA1: grayDarkA.grayA1,
  neutralA2: grayDarkA.grayA2,
  neutralA3: grayDarkA.grayA3,
  neutralA4: grayDarkA.grayA4,
  neutralA5: grayDarkA.grayA5,
  neutralA6: grayDarkA.grayA6,
  neutralA7: grayDarkA.grayA7,
  neutralA8: grayDarkA.grayA8,
  neutralA9: grayDarkA.grayA9,
  neutralA10: grayDarkA.grayA10,
  neutralA11: grayDarkA.grayA11,
  neutralA12: grayDarkA.grayA12,

  neutralContrast: '#fff',
} as const;

const red = {
  ...radixRed,
  ...redA,

  redContrast: '#fff',
} as const;

const redDark = {
  ...radixRedDark,
  ...redDarkA,

  redContrast: '#fff',
} as const;

const green = {
  ...radixGreen,
  ...greenA,

  greenContrast: '#fff',
} as const;

const greenDark = {
  ...radixGreenDark,
  ...greenDarkA,

  greenContrast: '#fff',
} as const;

const commonColors = {
  white: '#fff',
  black: '#000',
  transparent: 'transparent',
  ...blackA,
  ...whiteA,
};

const lightThemeColors = {
  ...commonColors,
  ...primary,
  ...neutral,
  ...red,
  ...green,

  background: '#fff',
  overlay: blackA.blackA6,
  overlayMuted: blackA.blackA3,
  shadow: neutral.neutralA9,
} as const;

const darkThemeColors = {
  ...commonColors,
  ...primaryDark,
  ...neutralDark,
  ...redDark,
  ...greenDark,

  background: '#020202',
  overlay: blackA.blackA8,
  overlayMuted: blackA.blackA6,
  shadow: neutral.neutralA11,
} as const;

type Color = 'primary' | 'neutral' | 'red' | 'green';
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
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A9'
  | 'A10'
  | 'A11'
  | 'A12'
  | 'Contrast';

export { lightThemeColors, darkThemeColors };
export type { Color };
