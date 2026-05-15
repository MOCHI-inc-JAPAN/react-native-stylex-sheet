import type { RNStyle } from '@mochi-inc-japan/react-native-stylex-sheet';

export { vars, themes, media } from './tokens';
export type {
  Variants,
  XRNStyle,
  RNStyle,
  XRNStyleSheets,
} from '@mochi-inc-japan/react-native-stylex-sheet';

export type StyleEntry = Record<string, RNStyle>;

export type SpaceKey =
  | 'none'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'max';
