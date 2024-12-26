import * as React from 'react';

/**
 * This is a workaround for `React.forwardRef` not supporting generics
 */
function genericForwardRef<T, P>(
  Component: (props: P, ref: React.ForwardedRef<T>) => React.ReactNode,
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return React.forwardRef(Component as any) as any;
}

export { genericForwardRef };
