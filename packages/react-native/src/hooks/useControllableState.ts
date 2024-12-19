import React from 'react';

type UseControllableStateProps<T> = {
  defaultValue: T;
  controlledValue?: T;
  onControlledChange?: (value: T) => void;
};

function useControllableState<T>({
  defaultValue,
  controlledValue,
  onControlledChange = () => {},
}: UseControllableStateProps<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<T>(defaultValue);

  const isControlled = controlledValue !== undefined;

  const value = isControlled ? (controlledValue as T) : uncontrolledValue;

  const setValue = React.useCallback(
    (newValue: React.SetStateAction<T>) => {
      const resolvedValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue;

      if (isControlled) {
        // Call onControlledChange when controlled to notify parent of the new value
        onControlledChange(resolvedValue);
      } else {
        // Update internal state when uncontrolled
        setUncontrolledValue(resolvedValue);
        // Call onControlledChange even if uncontrolled to notify user with the updated value
        onControlledChange(resolvedValue);
      }
    },
    [isControlled, onControlledChange, value],
  );

  return [value, setValue];
}

export { useControllableState };
export type { UseControllableStateProps };
