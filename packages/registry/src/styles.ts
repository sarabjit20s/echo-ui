import { Registry, RegistryItem } from './schema';

// Write styles in
// - `lower to higher registryDependencies` order
// - less depend on other styles

export const tokens: RegistryItem = {
  name: 'tokens.ts',
  type: 'style',
};

export const themes: RegistryItem = {
  name: 'themes.ts',
  type: 'style',
  registryDependencies: [tokens],
};

export const unistyles: RegistryItem = {
  name: 'unistyles.ts',
  type: 'style',
  registryDependencies: [themes, tokens],
};

export const styles: Registry = [tokens, themes, unistyles];
