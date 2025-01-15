import { Registry, RegistryItem } from '../schema';

// Write hooks in
// - `lower to higher registryDependencies` order
// - less depend on other hooks

export const useControllableState: RegistryItem = {
  name: 'useControllableState.ts',
  type: 'hook',
};

export const useInsets: RegistryItem = {
  name: 'useInsets.ts',
  type: 'hook',
};

export const useScreenDimensions: RegistryItem = {
  name: 'useScreenDimensions.ts',
  type: 'hook',
};

export const usePositioning: RegistryItem = {
  name: 'usePositioning.ts',
  type: 'hook',
  registryDependencies: [useInsets, useScreenDimensions],
};

export const hooks: Registry = [
  useControllableState,
  useInsets,
  useScreenDimensions,
  usePositioning,
];
