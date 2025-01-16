import React from 'react';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export type PackageInstallerProps = {
  dependencies: string[];
  asDev?: boolean;
};

export function PackageInstaller({
  dependencies,
  asDev = false,
}: PackageInstallerProps) {
  return (
    <Tabs
      groupId="package-manager"
      persist
      items={['npm', 'yarn', 'pnpm', 'bun']}
      className="[&>figure]:my-0 [&>figure]:rounded-none [&>figure]:border-none mb-0"
    >
      <Tab value="npm">
        <DynamicCodeBlock
          lang="bash"
          code={`npm install ${asDev ? '-D' : ''} ${dependencies.join(' ')}`}
        />
      </Tab>
      <Tab value="yarn">
        <DynamicCodeBlock
          lang="bash"
          code={`yarn add ${asDev ? '-D' : ''} ${dependencies.join(' ')}`}
        />
      </Tab>
      <Tab value="pnpm">
        <DynamicCodeBlock
          lang="bash"
          code={`pnpm add ${asDev ? '-D' : ''} ${dependencies.join(' ')}`}
        />
      </Tab>
      <Tab value="bun">
        <DynamicCodeBlock
          lang="bash"
          code={`bun add ${asDev ? '-D' : ''} ${dependencies.join(' ')}`}
        />
      </Tab>
    </Tabs>
  );
}
