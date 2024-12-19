import './global.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Echo UI',
  description:
    'A collection of pre-built, high-quality React Native components designed to accelerate your mobile app development.',
  keywords: [
    'React Native',
    'React Native UI Library',
    'React Native UI Components Library',
    'Expo',
    'Unistyles',
    'Unistyles UI Library',
    'Unistyles UI Components Library',
  ],
  creator: 'sarabjit',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
