import { registryWithCode } from '../registry-with-code';
import { Registry, RegistryItemWithCode, RegistryWithCode } from '../schema';

/**
 * Retrieves registry items with their associated code, ensuring no duplicates.
 *
 * This function takes a registry of items and returns a list of items with
 * their code, resolving any registry dependencies recursively. It ensures that each
 * item is only processed once by maintaining a map of already added item
 * names.
 *
 * @param {Registry} registry - The list of registry items to process.
 * @param {string[]} alreadyAddedItemNames - An optional array of item names
 *        that have already been processed, to avoid duplicates.
 * @returns {RegistryWithCode} - A list of registry items with their code,
 *          including any resolved registry dependencies.
 *
 * @throws Will throw an error if an item with a given name is not found in
 *         the registry.
 */
export function getRegistryItemsWithCode(
  registry: Registry,
  alreadyAddedItemNames: string[] = [],
): RegistryWithCode {
  const registryWithCodeMap = new Map<string, RegistryItemWithCode>();

  for (const item of registry) {
    if (
      registryWithCodeMap.has(item.name) ||
      alreadyAddedItemNames.includes(item.name)
    ) {
      continue;
    }

    const itemWithCode = registryWithCode.find((itemWithCode) => {
      return itemWithCode.name === item.name;
    });

    if (!itemWithCode) {
      throw new Error(
        `Item with name '${item.name}' not found in the registry`,
      );
    }

    registryWithCodeMap.set(item.name, itemWithCode);

    if (item.registryDependencies?.length) {
      const items = getRegistryItemsWithCode(
        item.registryDependencies,
        Array.from(registryWithCodeMap.keys()),
      );

      for (const item of items) {
        registryWithCodeMap.set(item.name, item);
      }
    }
  }

  return Array.from(registryWithCodeMap.values());
}
