import fs from 'fs';
import path from 'path';

const pkgJsonPath = path.join(process.cwd(), 'package.json');

export function getPackageJson() {
  if (!isPackageJsonExists()) {
    return null;
  }
  return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
}

export function isPackageJsonExists() {
  return fs.existsSync(pkgJsonPath);
}
