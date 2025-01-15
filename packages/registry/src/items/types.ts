import { Registry, RegistryItem } from '../schema';

// Write types in
// - `lower to higher registryDependencies` order
// - less depend on other types

export const components: RegistryItem = {
  name: 'components.ts',
  type: 'type',
};

export const types: Registry = [components];
