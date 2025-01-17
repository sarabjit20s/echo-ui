import React from 'react';
import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 justify-center items-center text-center">
      <Hero />
    </main>
  );
}

function Hero() {
  return (
    <div className="flex flex-col gap-8 items-center text-center max-w-2xl">
      <h1 className="text-4xl font-medium tracking-tight text-fd-foreground sm:text-5xl md:text-6xl md:leading-[1.1]">
        Build Stunning React Native Apps Faster
      </h1>
      <p className="text-lg text-fd-muted-foreground md:text-xl">
        A collection of beautifully designed, accessible components, just pure
        flexibility and control.
      </p>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Button size="lg" asChild>
          <Link href="/docs">
            Get Started <ArrowRight />
          </Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="https://github.com/sarabjit20s/saaj-ui">
            <Github /> Github
          </Link>
        </Button>
      </div>
    </div>
  );
}
