import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {
  RegistryItemType,
  RegistryItemWithCode,
  RegistryWithCode,
} from '@echo-ui/registry/src/schema';
import yoctoSpinner from 'yocto-spinner';

import { getProjectConfig, ProjectConfig } from '../get-project-config';
import { install, installDev } from '../install';
import { getPackageJson } from '../get-package-json';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://saaj-ui.vercel.app';

export async function getRegistryItems(
  names: string[],
  type?: RegistryItemType,
) {
  const response = await fetch(
    `${baseUrl}/api/registry/items?names=${names.join(',')}&${type ? `type=${type}` : ''}`,
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data?.error || 'Error fetching registry items');
    process.exit(1);
  }

  return data as RegistryWithCode;
}

export async function addRegistryItems(
  registry: RegistryWithCode,
  projectConfig?: ProjectConfig,
) {
  const config = projectConfig || getProjectConfig();
  if (!config) {
    console.error(
      `No ${chalk.yellow('components.json')} file found. Please run ${chalk.cyan('init')} first.`,
    );
    process.exit(1);
  }
  for (const item of registry) {
    await addRegistryItem(item, config);
  }
}

export async function addRegistryItem(
  item: RegistryItemWithCode,
  config: ProjectConfig,
) {
  const dirpath = getDirpath(item.type, config);

  const itemExists = fs.existsSync(path.join(dirpath, item.name));

  // don't add or update if an item already exists in the directory for now
  if (itemExists) {
    return;
  }

  const spinner = yoctoSpinner({
    text: `Adding ${item.name}`,
  }).start();

  // create directory
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath, { recursive: true });
  }

  // install dependencies
  if (item.dependencies?.length) {
    // filter out installed dependencies
    const filteredDependencies = filterOutInstalledDependencies(
      ...item.dependencies,
    );
    if (filteredDependencies.length > 0) {
      const spinner = yoctoSpinner({
        text: `Installing dependencies...`,
      }).start();

      await install(...filteredDependencies);

      spinner.success();
    }
  }

  // install dev dependencies
  if (item.devDependencies?.length) {
    // filter out installed dev dependencies
    const filteredDependencies = filterOutInstalledDevDependencies(
      ...item.devDependencies,
    );
    if (filteredDependencies.length > 0) {
      const spinner = yoctoSpinner({
        text: `Installing dev dependencies...`,
      }).start();

      await installDev(...filteredDependencies);

      spinner.success();
    }
  }

  // add registry dependencies
  if (item.registryDependencies?.length) {
    await addRegistryItems(item.registryDependencies);
  }

  // write file
  fs.writeFileSync(path.join(dirpath, item.name), item.code, 'utf8');

  spinner.success();
}

function getDirpath(itemType: RegistryItemType, config: ProjectConfig) {
  switch (itemType) {
    case 'component':
      return config.dirs.components;
    case 'hook':
      return config.dirs.hooks;
    case 'style':
      return config.dirs.styles;
    case 'type':
      return config.dirs.types;
    case 'utility':
      return config.dirs.utils;
    // TODO: handle default case
  }
}

function filterOutInstalledDependencies(...deps: string[]) {
  const pkgJson = getPackageJson();

  return deps.filter((dep) => {
    if (!pkgJson?.dependencies) {
      return true;
    }
    return !pkgJson.dependencies[dep];
  });
}

function filterOutInstalledDevDependencies(...deps: string[]) {
  const pkgJson = getPackageJson();

  return deps.filter((dep) => {
    if (!pkgJson?.devDependencies) {
      return true;
    }
    return !pkgJson.devDependencies[dep];
  });
}
