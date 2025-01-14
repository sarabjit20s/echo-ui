#!/usr/bin/env node
import { Command } from 'commander';

import { init } from '@/src/commands/init';
import { add } from '@/src/commands/add';
import packageJson from '@/package.json';

async function main() {
  const program = new Command()
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version);

  program.addCommand(init).addCommand(add);

  await program.parseAsync();
}

main();