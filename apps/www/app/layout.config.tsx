import React from 'react';
import { Logo } from '@/components/logo';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex flex-row gap-2 items-center">
        <Logo size="sm" />
        <span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
          Echo UI
        </span>
      </div>
    ),
    transparentMode: 'top',
  },
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'Components',
      url: '/docs/components/accordion',
      active: 'nested-url',
    },
  ],
  githubUrl: 'https://github.com/sarabjit20s/echo-ui',
};
