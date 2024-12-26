import React from 'react';

export type PolymorphicProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
  };
