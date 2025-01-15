import { Registry, RegistryItem } from '../schema';
import { components as componentsTypes } from './types';
import { composeRefs, genericForwardRef } from './utils';
import { tokens } from './styles';
import {
  useControllableState,
  useInsets,
  usePositioning,
  useScreenDimensions,
} from './hooks';

// Write components in
// - `lower to higher registryDependencies` order
// - less depend on other components

export const Portal: RegistryItem = {
  name: 'Portal.tsx',
  type: 'component',
};

export const TextArea: RegistryItem = {
  name: 'TextArea.tsx',
  type: 'component',
};

export const Spinner: RegistryItem = {
  name: 'Spinner.tsx',
  type: 'component',
  dependencies: ['react-native-reanimated', 'react-native-svg'],
};

export const Icon: RegistryItem = {
  name: 'Icon.tsx',
  type: 'component',
  dependencies: [
    '@react-native-vector-icons/common',
    '@react-native-vector-icons/ionicons',
  ],
  devDependencies: ['@types/react-native-vector-icons'],
  registryDependencies: [tokens],
};

export const Separator: RegistryItem = {
  name: 'Separator.tsx',
  type: 'component',
  registryDependencies: [genericForwardRef, componentsTypes],
};

export const TextInput: RegistryItem = {
  name: 'TextInput.tsx',
  type: 'component',
  registryDependencies: [genericForwardRef, componentsTypes],
};

export const Text: RegistryItem = {
  name: 'Text.tsx',
  type: 'component',
  registryDependencies: [genericForwardRef, componentsTypes, tokens],
};

export const Collapsible: RegistryItem = {
  name: 'Collapsible.tsx',
  type: 'component',
  registryDependencies: [
    useControllableState,
    genericForwardRef,
    componentsTypes,
  ],
  dependencies: ['react-native-reanimated'],
};

export const RadioGroup: RegistryItem = {
  name: 'RadioGroup.tsx',
  type: 'component',
  registryDependencies: [
    useControllableState,
    genericForwardRef,
    componentsTypes,
  ],
};

export const Accordion: RegistryItem = {
  name: 'Accordion.tsx',
  type: 'component',
  registryDependencies: [
    useControllableState,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
  dependencies: ['react-native-reanimated'],
};

export const Alert: RegistryItem = {
  name: 'Alert.tsx',
  type: 'component',
  registryDependencies: [
    Text,
    Icon,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
};

export const Avatar: RegistryItem = {
  name: 'Avatar.tsx',
  type: 'component',
  registryDependencies: [
    Text,
    Icon,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
};

export const Badge: RegistryItem = {
  name: 'Badge.tsx',
  type: 'component',
  registryDependencies: [
    Text,
    Icon,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
};

export const Button: RegistryItem = {
  name: 'Button.tsx',
  type: 'component',
  registryDependencies: [
    Text,
    Icon,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
};

export const Checkbox: RegistryItem = {
  name: 'Checkbox.tsx',
  type: 'component',
  registryDependencies: [
    Icon,
    useControllableState,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
};

export const Popup: RegistryItem = {
  name: 'Popup.tsx',
  type: 'component',
  registryDependencies: [
    Portal,
    useControllableState,
    useInsets,
    usePositioning,
    useScreenDimensions,
    genericForwardRef,
    componentsTypes,
  ],
  dependencies: ['react-native-svg'],
};

export const Popover: RegistryItem = {
  name: 'Popover.tsx',
  type: 'component',
  registryDependencies: [Popup, genericForwardRef],
  dependencies: ['react-native-reanimated'],
};

export const Dialog: RegistryItem = {
  name: 'Dialog.tsx',
  type: 'component',
  registryDependencies: [
    Text,
    Portal,
    useControllableState,
    useInsets,
    useScreenDimensions,
    composeRefs,
    genericForwardRef,
    componentsTypes,
  ],
  dependencies: ['react-native-reanimated'],
};

export const DropdownMenu: RegistryItem = {
  name: 'DropdownMenu.tsx',
  type: 'component',
  registryDependencies: [
    Checkbox,
    Icon,
    Popup,
    RadioGroup,
    Separator,
    Text,
    genericForwardRef,
    componentsTypes,
    tokens,
  ],
  dependencies: ['react-native-reanimated'],
};

export const components: Registry = [
  Portal,
  TextArea,
  Spinner,
  Icon,
  Separator,
  TextInput,
  Text,
  Collapsible,
  RadioGroup,
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Popup,
  Popover,
  Dialog,
  DropdownMenu,
];
