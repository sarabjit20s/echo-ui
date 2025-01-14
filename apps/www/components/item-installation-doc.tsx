import React from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PackageRunner } from './package-runner';
import { ItemManualInstallation } from './item-manual-installation';

// INFO: We are calling this component a `ItemInstallationDoc` not a `ComponentInstallationDoc`
// because it is also responsible for rendering the installation instructions for hooks, utilities and types

export type ItemInstallationDocProps = {
  name: string;
};
export function ItemInstallationDoc({ name }: ItemInstallationDocProps) {
  return (
    <Tabs defaultValue="cli">
      <TabsList>
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>

      <TabsContent value="cli">
        <PackageRunner command={`saaj add ${name}`} />
      </TabsContent>

      <TabsContent value="manual">
        <ItemManualInstallation name={name} />
      </TabsContent>
    </Tabs>
  );
}
