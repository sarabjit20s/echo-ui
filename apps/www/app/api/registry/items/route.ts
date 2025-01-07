import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { registry } from '@echo-ui/registry';
import {
  Registry,
  RegistryItemType,
  RegistryItemWithCode,
  RegistryWithCode,
} from '@echo-ui/registry/schema';

// for now we are getting the components from the local node_modules folder

const componentsDirpath = path.join(
  process.cwd(),
  'node_modules',
  '@echo-ui/react-native/src/components',
);

const hooksDirpath = path.join(
  process.cwd(),
  'node_modules',
  '@echo-ui/react-native/src/hooks',
);

const typesDirpath = path.join(
  process.cwd(),
  'node_modules',
  '@echo-ui/react-native/src/types',
);

const utilsDirpath = path.join(
  process.cwd(),
  'node_modules',
  '@echo-ui/react-native/src/utils',
);

const stylesDirpath = path.join(
  process.cwd(),
  'node_modules',
  '@echo-ui/react-native/src/styles',
);

const registryItemTypes: RegistryItemType[] = [
  'component',
  'hook',
  'type',
  'utility',
  'style',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const names = searchParams.get('names')?.split(',') || [];
    const itemType = searchParams.get('type');

    if (names.length === 0) {
      return Response.json(
        {
          error: 'A list of item names must be provided in the query string',
        },
        {
          status: 400,
        },
      );
    }

    if (itemType && !registryItemTypes.includes(itemType as any)) {
      return Response.json(
        {
          error: `Invalid item type '${itemType}' provided. Valid types are: ${registryItemTypes.join(', ')}`,
        },
        {
          status: 400,
        },
      );
    }

    const items: Registry = [];
    const notFoundItems: string[] = [];

    for (const name of names) {
      const data = registry.find((item) =>
        itemType
          ? item.type === itemType &&
            item.name.split('.')[0] === name.split('.')[0]
          : item.name.split('.')[0] === name.split('.')[0],
      );

      if (data) {
        items.push(data);
      } else {
        notFoundItems.push(name);
      }
    }

    if (notFoundItems.length > 0) {
      return Response.json(
        {
          error: `The following items could not be found: ${notFoundItems.join(', ')}. It may not exist in the registry. Please make sure items names are correct.`,
        },
        {
          status: 404,
        },
      );
    }

    // sort items by low to high `registryDependencies` length
    const sortedItems = items.sort((a, b) => {
      const aLength = a.registryDependencies?.length || 0;
      const bLength = b.registryDependencies?.length || 0;
      return aLength - bLength;
    });

    const registryWithCode = createRegistryWithCode(sortedItems);

    return Response.json(registryWithCode);
  } catch (error) {
    console.error('Error fetching registry items:', error);
    return Response.json(
      { error: 'Error fetching registry items' },
      { status: 500 },
    );
  }
}

function createRegistryWithCode(registry: Registry) {
  const registryWithCode: RegistryWithCode = [];

  for (const item of registry) {
    const newItem: RegistryItemWithCode = {
      ...(item as any),
      code: getCode(item.type, item.name),
    };

    if (item.registryDependencies?.length) {
      const registry = createRegistryWithCode(item.registryDependencies);

      newItem.registryDependencies = registry;
    }

    registryWithCode.push(newItem);
  }

  return registryWithCode;
}

function getCode(type: RegistryItemType, name: string) {
  let code = '';
  switch (type) {
    case 'component':
      code = fs.readFileSync(path.join(componentsDirpath, name), 'utf8');
      break;
    case 'hook':
      code = fs.readFileSync(path.join(hooksDirpath, name), 'utf8');
      break;
    case 'type':
      code = fs.readFileSync(path.join(typesDirpath, name), 'utf8');
      break;
    case 'utility':
      code = fs.readFileSync(path.join(utilsDirpath, name), 'utf8');
      break;
    case 'style':
      code = fs.readFileSync(path.join(stylesDirpath, name), 'utf8');
      break;
    default:
      break;
  }
  return code;
}
