/* eslint-disable @typescript-eslint/no-empty-object-type */
import { UnistylesRegistry } from 'react-native-unistyles';

import { Breakpoints, breakpoints } from './tokens';
import { themes, Themes } from './themes';

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends Breakpoints {}
  export interface UnistylesThemes extends Themes {}
}

UnistylesRegistry.addBreakpoints(breakpoints).addThemes(themes).addConfig({
  adaptiveThemes: true,
});
