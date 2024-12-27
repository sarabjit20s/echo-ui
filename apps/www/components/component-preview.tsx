'use client';
import { useLayoutEffect, useState } from 'react';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { cn } from '@/lib/cn';

const components = [
  'Accordion',
  'Alert',
  'Avatar',
  'Badge',
  'Button',
  'Checkbox',
  'Collapsible',
  'Dialog',
  'DropdownMenu',
  'Icon',
  'Popover',
  'Popup',
  'RadioGroup',
  'Separator',
  'Spinner',
  'Text',
  'TextArea',
  'TextInput',
] as const;

type Theme = 'light' | 'dark';

type ComponentName = (typeof components)[number];

type Preview = {
  /**
   * dark mode src
   */
  dark: string;
  /**
   * light mode src
   */
  light: string;
};

const previews: Record<ComponentName, Preview> = {
  Accordion: {
    dark: 'https://i.imghippo.com/files/hAWy2354SQI.png',
    light: 'https://i.imghippo.com/files/ITIP4851sfI.png',
  },
  Alert: {
    dark: 'https://i.imghippo.com/files/Qc5802HQ.png',
    light: 'https://i.imghippo.com/files/CpFA9818QaE.png',
  },
  Avatar: {
    dark: 'https://i.imghippo.com/files/iJwR8193Sw.png',
    light: 'https://i.imghippo.com/files/ne4115hM.png',
  },
  Badge: {
    dark: 'https://i.imghippo.com/files/CYUd7662Bs.png',
    light: 'https://i.imghippo.com/files/THw2994Imw.png',
  },
  Button: {
    dark: 'https://i.imghippo.com/files/eNPs5185to.png',
    light: 'https://i.imghippo.com/files/Sztw3478Lfs.png',
  },
  Checkbox: {
    dark: 'https://i.imghippo.com/files/GOy5696AY.png',
    light: 'https://i.imghippo.com/files/YYXl8136O.png',
  },
  Collapsible: {
    dark: 'https://i.imghippo.com/files/oav1891kow.png',
    light: 'https://i.imghippo.com/files/oeQi5412kT.png',
  },
  Dialog: {
    dark: 'https://i.imghippo.com/files/uEZ1402iE.png',
    light: 'https://i.imghippo.com/files/uk4777dA.png',
  },
  DropdownMenu: {
    dark: 'https://i.imghippo.com/files/nYu5829eE.png',
    light: 'https://i.imghippo.com/files/MJT1193Eg.png',
  },
  Icon: {
    dark: 'https://i.imghippo.com/files/aGEB2558Mk.png',
    light: 'https://i.imghippo.com/files/Toph7615AV.png',
  },
  Popover: {
    dark: 'https://i.imghippo.com/files/aRSL6435awk.png',
    light: 'https://i.imghippo.com/files/nCSK3202UNA.png',
  },
  Popup: {
    dark: 'https://i.imghippo.com/files/NCSl5135Ko.png',
    light: 'https://i.imghippo.com/files/uu8187r.png',
  },
  RadioGroup: {
    dark: 'https://i.imghippo.com/files/Iad5639WvE.png',
    light: 'https://i.imghippo.com/files/HB6258BaU.png',
  },
  Separator: {
    dark: 'https://i.imghippo.com/files/HQwr4150JQ.png',
    light: 'https://i.imghippo.com/files/QCE5285y.png',
  },
  Spinner: {
    dark: 'https://i.imghippo.com/files/ODzO1010xqk.png',
    light: 'https://i.imghippo.com/files/Ez2568DlI.png',
  },
  Text: {
    dark: 'https://i.imghippo.com/files/G6740IoY.png',
    light: 'https://i.imghippo.com/files/Ykj8333PZY.png',
  },
  TextArea: {
    dark: 'https://i.imghippo.com/files/JrJh1316pPM.png',
    light: 'https://i.imghippo.com/files/RaR5464nWg.png',
  },
  TextInput: {
    dark: 'https://i.imghippo.com/files/AQN4415JA.png',
    light: 'https://i.imghippo.com/files/Ygd1749vWI.png',
  },
};

// const ratio = 2.158; // height / width
const ratio = 2.168; // height / width
const imgWidth = 240;
const imgHeight = imgWidth * ratio;

export type ComponentPreviewProps = {
  name: ComponentName;
};

export const ComponentPreview = ({ name }: ComponentPreviewProps) => {
  const [classNameTheme, setClassNameTheme] = useState<Theme | null>(null);

  useLayoutEffect(() => {
    const docElem = window.document.documentElement;

    const observer = new MutationObserver(() => {
      const className = docElem.className;
      const theme: Theme = className.includes('dark') ? 'dark' : 'light';

      setClassNameTheme(theme);
    });

    observer.observe(docElem, {
      attributes: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!components.includes(name)) {
    return;
  }

  const src = classNameTheme ? previews[name][classNameTheme] : null;

  return (
    <div
      className={cn(
        'relative rounded-xl',
        !src ? 'bg-fd-accent' : 'bg-transparent',
      )}
      style={{
        width: imgWidth,
        height: imgHeight,
        // fumadocs-ui adds 2em to the top and bottom on image comp by default
        // this is to avoid layout shifting
        marginTop: !src ? '2em' : 0,
        marginBottom: !src ? '2em' : 0,
      }}
    >
      {src && (
        <ImageZoom
          src={src}
          alt={`Preview of ${name} component`}
          width={imgWidth}
          height={imgHeight}
          className="border rounded-xl"
          priority
          suppressHydrationWarning
        />
      )}
    </div>
  );
};
