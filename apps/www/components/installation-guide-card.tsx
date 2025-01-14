import { cn } from '@/lib/cn';
import React from 'react';

export type InstallationGuideCardProps = React.HTMLProps<HTMLAnchorElement>;

export function InstallationGuideCard({
  className,
  ...restProps
}: InstallationGuideCardProps): React.ReactElement {
  return (
    <a
      className={cn(
        'not-prose flex flex-col items-center gap-2 p-8 border rounded-2xl no-underline [&_svg]:size-12 hover:bg-fd-accent/50',
        className,
      )}
      {...restProps}
    />
  );
}
