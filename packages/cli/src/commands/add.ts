import { Command } from 'commander';
import chalk from 'chalk';
import { RegistryItemType } from '@saaj-ui/registry';

import {
  getProjectConfig,
  isValidProjectConfig,
} from '../utils/get-project-config';
import { addRegistryItems, fetchRegistryItems } from '../utils/registry';
import { isPackageJsonExists } from '../utils/get-package-json';

export const add = new Command()
  .name('add')
  .description('add a component, hook, type, utility, or style to your project')
  .argument(
    '<items...>',
    'the items(components, hooks, types, utils, styles) to add',
  )
  .option('-C, --component', 'add a component', false)
  .option('-H, --hook', 'add a hook', false)
  .option('-T, --type', 'add a type', false)
  .option('-U, --utility', 'add a utility', false)
  .option('-S, --style', 'add a style', false)
  .action(async (items, options) => {
    // check if package.json file exists or not
    if (!isPackageJsonExists()) {
      console.error(
        `No ${chalk.yellow('package.json')} file found, please create a react-native project first and then run ${chalk.cyan('init')}.`,
      );
      process.exit(1);
    }

    const projectConfig = validateProjectConfig();

    // if -C or --component is passed, it means the items(argument) are components
    // if -H or --hook is passed, it means the items(argument) are hooks
    // same logic for the -T, -U, -S options

    const itemsType = getItemsType(options);

    const registryItems = await fetchRegistryItems(items, itemsType);

    await addRegistryItems(registryItems, projectConfig);
  });

function validateProjectConfig() {
  const config = getProjectConfig();
  if (!config) {
    console.error(
      `No ${chalk.yellow('components.json')} file found. Please run ${chalk.cyan('init')} first.`,
    );
    process.exit(1);
  } else if (!isValidProjectConfig(config)) {
    console.error(
      `Invalid ${chalk.yellow('components.json')} file found. To start over, remove ${chalk.yellow('components.json')} file and run ${chalk.cyan('init')} again.`,
    );
    process.exit(1);
  } else {
    return config;
  }
}

function getItemsType(options: any): RegistryItemType | undefined {
  if (options.component) {
    return 'component';
  }
  if (options.hook) {
    return 'hook';
  }
  if (options.type) {
    return 'type';
  }
  if (options.utility) {
    return 'utility';
  }
  if (options.style) {
    return 'style';
  }
}
