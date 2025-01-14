import React from 'react';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export type PackageManagerProps = {
  command: string;
};

export function PackageManager({ command }: PackageManagerProps) {
  return (
    <Tabs
      groupId="package-manager"
      persist
      items={['npm', 'yarn', 'pnpm', 'bun']}
      className="[&>figure]:my-0 [&>figure]:rounded-none [&>figure]:border-none mb-0"
    >
      <Tab value="npm">
        <DynamicCodeBlock lang="bash" code={`npm ${command}`} />
      </Tab>
      <Tab value="yarn">
        <DynamicCodeBlock lang="bash" code={`yarn ${command}`} />
      </Tab>
      <Tab value="pnpm">
        <DynamicCodeBlock lang="bash" code={`pnpm ${command}`} />
      </Tab>
      <Tab value="bun">
        <DynamicCodeBlock lang="bash" code={`bun ${command}`} />
      </Tab>
    </Tabs>
  );
}
