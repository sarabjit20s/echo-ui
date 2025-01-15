import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import yoctoSpinner from 'yocto-spinner';
import { input } from '@inquirer/prompts';

import { install } from '@/src/utils/install';
import { addRegistryItems, fetchRegistryItems } from '@/src/utils/registry';
import {
  DEFAULT_HOOKS_DIR_PATH,
  DEFAULT_STYLES_DIR_PATH,
  DEFAULT_TYPES_DIR_PATH,
  DEFAULT_COMPONENTS_DIR_PATH,
  DEFAULT_UTILS_DIR_PATH,
  ProjectConfig,
  PROJECT_CONFIG_SCHEMA_URL,
  PROJECT_CONFIG_FILE_PATH,
  getProjectConfig,
  isValidProjectConfig,
} from '@/src/utils/get-project-config';
import { isPackageJsonExists } from '@/src/utils/get-package-json';

const PROJECT_DEPENDENCIES = ['react-native-unistyles', '@radix-ui/colors'];

export const init = new Command()
  .name('init')
  .description('initialize project setup and install dependencies')
  .action(async () => {
    try {
      await runInit();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

export async function runInit() {
  // check if package.json file exists or not
  if (!isPackageJsonExists()) {
    console.error(
      `No ${chalk.yellow('package.json')} file, please create a react-native project first and then run ${chalk.cyan('init')}.`,
    );
    process.exit(1);
  }

  // create project config
  await promptProjectConfig();

  // install dependencies
  const depsSpinner = yoctoSpinner({
    text: 'Installing dependencies...',
  }).start();
  await install(...PROJECT_DEPENDENCIES);
  depsSpinner.success();

  // configure types
  await configureTypes();

  // configure styles
  await configureStyles();

  // configure utils
  await configureUtils();

  // configure hooks
  await configureHooks();

  console.log(
    `${chalk.green('Success!')} Setup completed. You may now add components.`,
  );
}

export async function promptProjectConfig(): Promise<ProjectConfig> {
  if (fs.existsSync(PROJECT_CONFIG_FILE_PATH)) {
    const projectConfig = getProjectConfig();

    // validate project config
    if (!isValidProjectConfig(projectConfig)) {
      console.error(
        `Invalid ${chalk.yellow('components.json')} file found. To start over, remove ${chalk.yellow('components.json')} file and run ${chalk.cyan('init')} again.`,
      );
      process.exit(1);
    } else {
      console.log(`Valid ${chalk.cyan('components.json')} file found.`);

      // @ts-ignore we know if a `components.json` file exists, then config can't be null after validation
      return projectConfig;
    }
  }
  // path for `components` dir
  const components = await input({
    message: `Where would you like to keep your ${chalk.cyan('components')}?`,
    default: DEFAULT_COMPONENTS_DIR_PATH,
  });

  // path for `hooks` dir
  const hooks = await input({
    message: `Where would you like to keep your ${chalk.cyan('hooks')}?`,
    default: DEFAULT_HOOKS_DIR_PATH,
  });

  // path for `utils` dir
  const utils = await input({
    message: `Where would you like to keep your ${chalk.cyan('utils')}?`,
    default: DEFAULT_UTILS_DIR_PATH,
  });

  // path for `styles` dir
  const styles = await input({
    message: `Where would you like to keep your ${chalk.cyan('themes configuration')}?`,
    default: DEFAULT_STYLES_DIR_PATH,
  });

  // path for `types` dir
  const types = await input({
    message: `Where would you like to keep your ${chalk.cyan('types')}?`,
    default: DEFAULT_TYPES_DIR_PATH,
  });

  const config: ProjectConfig = {
    $schema: PROJECT_CONFIG_SCHEMA_URL,
    dirs: {
      components,
      hooks,
      styles,
      types,
      utils,
    },
  };

  fs.writeFileSync(PROJECT_CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
  return config;
}

export async function configureTypes() {
  const spinner = yoctoSpinner({
    text: 'Configuring types...',
  }).start();

  // we can even pass a file name without extension
  const files = ['components.ts'];
  const items = await fetchRegistryItems(files, 'type');

  await addRegistryItems(items);

  spinner.success();
}

export async function configureStyles() {
  const spinner = yoctoSpinner({
    text: 'Configuring styles...',
  }).start();

  // these are the required files to setup themes and unistyles
  const files = ['tokens.ts', 'themes.ts', 'unistyles.ts'];
  const items = await fetchRegistryItems(files, 'style');

  await addRegistryItems(items);

  spinner.success();
}

export async function configureUtils() {
  const spinner = yoctoSpinner({
    text: 'Configuring utils...',
  }).start();

  // these are the required utils
  const files = ['composeRefs.ts', 'genericForwardRef.ts'];
  const items = await fetchRegistryItems(files, 'utility');

  await addRegistryItems(items);

  spinner.success();
}

export async function configureHooks() {
  const spinner = yoctoSpinner({
    text: 'Configuring hooks...',
  }).start();

  // these are the required hooks
  const files = ['useControllableState.ts'];
  const items = await fetchRegistryItems(files, 'hook');

  await addRegistryItems(items);

  spinner.success();
}
