export const breakpoints = {
  mobile: 0,
  tablet: 768,
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type Breakpoints = typeof breakpoints;
