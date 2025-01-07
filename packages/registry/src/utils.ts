import { Registry, RegistryItem } from './schema';

// Write utils in
// - `lower to higher registryDependencies` order
// - less depend on other utils

export const composeRefs: RegistryItem = {
  name: 'composeRefs.ts',
  type: 'utility',
};

export const genericForwardRef: RegistryItem = {
  name: 'genericForwardRef.ts',
  type: 'utility',
};

export const utils: Registry = [composeRefs, genericForwardRef];
