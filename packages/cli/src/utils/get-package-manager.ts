import { detect } from 'package-manager-detector';

export async function getPackageManager() {
  const detectResult = await detect();

  return detectResult?.name ?? 'npm';
}
