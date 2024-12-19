import React from 'react';
import { Dimensions } from 'react-native';

const useScreenDimensions = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('screen'));

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setDimensions(screen);
    });

    return () => subscription.remove();
  }, []);

  return dimensions;
};

export { useScreenDimensions };
