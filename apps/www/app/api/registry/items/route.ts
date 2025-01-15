import { NextRequest } from 'next/server';
import { registry } from '@saaj-ui/registry';
import { Registry, RegistryItemType } from '@saaj-ui/registry/schema';
import { getRegistryItemsWithCode } from '@saaj-ui/registry/utils/get-registry-items-with-code';

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
          error: 'A list of item `names` must be provided in the query string',
        },
        {
          status: 400,
        },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const result = getRegistryItemsWithCode(sortedItems);

    return Response.json(result);
  } catch (error) {
    console.error('Error fetching registry items:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Error fetching registry items',
      },
      { status: 500 },
    );
  }
}
