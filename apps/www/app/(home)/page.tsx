import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/*************  ✨ Codeium Command ⭐  *************/
/**
 * The main entry point of the website.
 *
 * This component is responsible for rendering the main hero section of the
 * website. It renders a centered hero section with a greeting and a call to
 * action to explore the documentation.
 *
 * @returns The main entry point of the website.
 */
/******  a4b7f965-2fac-43f5-8c55-3f0019a52d85  *******/ export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 justify-center items-center text-center">
      <Hero />
    </main>
  );
}

function Hero() {
  return (
    <div className="flex flex-col gap-4 items-center text-center max-w-2xl">
      <h1 className="text-6xl font-bold tracking-tighter text-fd-foreground">
        Your building blocks for stunning mobile apps.
      </h1>
      <p className="text-xl text-fd-muted-foreground">
        A collection of reusable React Native components to speed up your
        development.
      </p>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Button size="lg" asChild>
          <Link href="/docs">
            Get Started <ArrowRight />
          </Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="https://github.com/sarabjit20s/echo-ui">
            <Github /> Github
          </Link>
        </Button>
      </div>
    </div>
  );
}
