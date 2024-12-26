import fs from 'fs';
import path from 'path';

function readFile(location: string) {
  const _path = path.resolve(process.cwd(), location);

  try {
    const content = fs.readFileSync(_path, 'utf8');
    return content.trim();
  } catch (error) {
    console.error(`Error reading file for ${location}:`, error);
    return null;
  }
}

export function readComponentFile(fileName: string, fileExtension = 'tsx') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/components/' +
      `${fileName}.${fileExtension}`,
  );
}

export function readHookFile(fileName: string, fileExtension = 'ts') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/hooks/' +
      `${fileName}.${fileExtension}`,
  );
}

export function readUtilFile(fileName: string, fileExtension = 'ts') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/utils/' +
      `${fileName}.${fileExtension}`,
  );
}

export function readTypeFile(fileName: string, fileExtension = 'ts') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/types/' +
      `${fileName}.${fileExtension}`,
  );
}

export function readTokenFile(fileName: string, fileExtension = 'ts') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/styles/tokens/' +
      `${fileName}.${fileExtension}`,
  );
}

export function readStylesFile(fileName: string, fileExtension = 'ts') {
  return readFile(
    'node_modules/@echo-ui/react-native/src/styles/' +
      `${fileName}.${fileExtension}`,
  );
}
