type ItemType = 'component' | 'hook' | 'utility' | 'type' | 'style';

type InternalDependency = {
  name: string;
  fileName: string;
  type: ItemType;
};

export type Metadata = {
  name: string;
  fileName: string;
  type: ItemType;
  internalDependencies?: InternalDependency[];
  externalDependencies?: string[];
};

export type UIItem = Metadata & {
  code: string;
};
