import type { Registry } from './schema';
import { utils } from './utils';
import { types } from './types';
import { styles } from './styles';

export const MINIMUM_REQUIRED_DEPENDENCIES = [
  'react-native-unistyles@2.20.0',
  '@radix-ui/colors',
] as const;

// these are those dependencies which are used by almost every components
export const MINIMUM_REQUIRED_REGISTRY_DEPENDENCIES: Registry = [
  ...types,
  ...styles,
  ...utils,
];
