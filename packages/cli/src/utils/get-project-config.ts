import fs from 'fs';
import path from 'path';

export type ProjectConfig = {
  $schema: string;
  dirs: {
    components: string;
    hooks: string;
    styles: string;
    types: string;
    utils: string;
  };
};

export const PROJECT_CONFIG_SCHEMA_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://saaj-ui.vercel.app' + '/schema.json';

export const DEFAULT_COMPONENTS_DIR_PATH = 'components/ui';
export const DEFAULT_HOOKS_DIR_PATH = 'hooks';
export const DEFAULT_STYLES_DIR_PATH = 'styles';
export const DEFAULT_TYPES_DIR_PATH = 'types';
export const DEFAULT_UTILS_DIR_PATH = 'utils';

export const PROJECT_CONFIG_FILE_PATH = path.join(
  process.cwd(),
  'components.json',
);

export function getProjectConfig(): ProjectConfig | null {
  if (!fs.existsSync(PROJECT_CONFIG_FILE_PATH)) {
    return null;
  } else {
    return JSON.parse(fs.readFileSync(PROJECT_CONFIG_FILE_PATH, 'utf8'));
  }
}

export function isValidProjectConfig(config: any) {
  const projectConfig = getProjectConfig();

  if (!projectConfig || !config) {
    return false;
  }

  return (
    typeof config === 'object' &&
    'dirs' in config &&
    typeof config.dirs === 'object' &&
    'components' in config.dirs &&
    'hooks' in config.dirs &&
    'styles' in config.dirs &&
    'types' in config.dirs &&
    'utils' in config.dirs &&
    typeof config.$schema === 'string' &&
    config.$schema === projectConfig?.$schema
  );
}
