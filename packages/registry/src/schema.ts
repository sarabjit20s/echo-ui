export type RegistryItemType =
  | 'component'
  | 'hook'
  | 'utility'
  | 'type'
  | 'style';

/**
 * - `name`: It should be the same as the file name with the extension
 * - `registryDependencies`: It should not include the current item
 */
export type RegistryItem = {
  name: string;
  type: RegistryItemType;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: RegistryItem[];
};

export type RegistryItemWithCode = Omit<
  RegistryItem,
  'registryDependencies'
> & {
  code: string;
  registryDependencies?: RegistryItemWithCode[];
};

export type Registry = RegistryItem[];

export type RegistryWithCode = RegistryItemWithCode[];
