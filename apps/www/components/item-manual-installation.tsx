import Link from 'next/link';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { registryWithCode } from '@saaj-ui/registry';
import { RegistryItem } from '@saaj-ui/registry/schema';

import { Steps, Step } from './steps';

export type ItemManualInstallationProps = {
  name: string;
  children?: React.ReactNode;
};

export async function ItemManualInstallation({
  children,
  name,
}: ItemManualInstallationProps) {
  const item = registryWithCode.find(
    (item) => item.name.split('.')[0] === name,
  );

  if (!item) {
    return (
      <div>
        <p>Item not found in registry</p>
      </div>
    );
  }

  const dependencies = item?.dependencies || [];
  const registryDependencies =
    item?.registryDependencies?.filter((item) => item.type !== 'style') || [];

  const code = item.code;

  return (
    <Steps>
      {(dependencies.length > 0 || registryDependencies.length > 0) && (
        <Step>
          <p>Make sure you have installed the following dependencies:</p>
          {registryDependencies.length > 0 && (
            <>
              <strong>Registry Dependencies</strong>
              <ul className="mt-2">
                {registryDependencies.map((dependency) => {
                  // ignore style dependencies
                  // because they are already added when the `init` command is run
                  if (dependency.type === 'style') {
                    return;
                  }
                  const url = getItemUrl(dependency);
                  return (
                    <li key={dependency.name}>
                      {url ? (
                        <Link href={url}>{dependency.name.split('.')[0]}</Link>
                      ) : (
                        dependency.name.split('.')[0]
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {dependencies.length > 0 && (
            <>
              <strong>NPM Dependencies</strong>
              <ul className="mt-2">
                {dependencies.map((dependency) => (
                  <li key={dependency}>
                    <code>{dependency}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Step>
      )}

      <Step>
        <p>Copy and paste the following code into your project.</p>
        <DynamicCodeBlock lang="tsx" code={code || ''} />
      </Step>

      <Step>
        <p>Update the import paths to match your project setup.</p>
      </Step>

      {/* Allow to additional steps */}
      {children}
    </Steps>
  );
}

function getItemUrl(item: RegistryItem) {
  const name = item.name.split('.')[0];
  if (item.type === 'component') {
    return `/docs/components/${name}`;
  } else if (item.type === 'hook') {
    return `/docs/hooks/${name}`;
  } else if (item.type === 'utility') {
    return `/docs/utils/${name}`;
  } else if (item.type === 'type') {
    return `/docs/types/${name}`;
  }
}
