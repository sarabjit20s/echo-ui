import { Registry } from './schema';
import { components } from './items/components';
import { hooks } from './items/hooks';
import { styles } from './items/styles';
import { types } from './items/types';
import { utils } from './items/utils';

export const registry: Registry = [
  ...components,
  ...hooks,
  ...styles,
  ...types,
  ...utils,
];
