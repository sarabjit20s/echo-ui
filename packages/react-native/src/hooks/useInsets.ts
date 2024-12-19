import React from 'react';
import { Dimensions } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

const useInsets = () => {
  const [insets, setInsets] = React.useState(UnistylesRuntime.insets);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setInsets(UnistylesRuntime.insets);
    });
    return () => subscription.remove();
  }, []);

  return insets;
};

export { useInsets };
