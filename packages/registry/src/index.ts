import { components } from './components';
import { hooks } from './hooks';
import { Registry } from './schema';
import { styles } from './styles';
import { types } from './types';
import { utils } from './utils';

export const registry: Registry = [
  ...components,
  ...hooks,
  ...styles,
  ...types,
  ...utils,
];
