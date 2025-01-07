import shell from 'shelljs';

import { getPackageManager } from './get-package-manager.js';

/**
 * Install given dependencies using the detected package manager.
 */
export async function install(...dependencies: string[]) {
  const pm = await getPackageManager();

  return shell.exec(
    `${pm} ${pm === 'npm' ? 'install' : 'add'} ${dependencies.join(' ')}`,
  );
}

/**
 * Install given dev dependencies using the detected package manager.
 */
export async function installDev(...devDependencies: string[]) {
  const pm = await getPackageManager();

  return shell.exec(
    `${pm} ${pm === 'npm' ? 'install' : 'add'} -D ${devDependencies.join(' ')}`,
  );
}
