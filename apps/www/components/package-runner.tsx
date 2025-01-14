import React from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

export type PackageRunnerProps = {
  command: string;
};

export function PackageRunner({ command }: PackageRunnerProps) {
  return (
    <Tabs
      groupId="package-manager"
      persist
      items={['npm', 'yarn', 'pnpm', 'bun']}
      className="[&>figure]:my-0 [&>figure]:rounded-none [&>figure]:border-none mb-0"
    >
      <Tab value="npm">
        <DynamicCodeBlock lang="bash" code={`npx ${command}`} />
      </Tab>
      <Tab value="yarn">
        <DynamicCodeBlock lang="bash" code={`yarn dlx ${command}`} />
      </Tab>
      <Tab value="pnpm">
        <DynamicCodeBlock lang="bash" code={`pnpm dlx ${command}`} />
      </Tab>
      <Tab value="bun">
        <DynamicCodeBlock lang="bash" code={`bunx ${command}`} />
      </Tab>
    </Tabs>
  );
}
