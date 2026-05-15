import { StyleSheet } from 'react-native';
import {
  create,
  props,
  mix,
  defineVars,
  useStylex as _useStylex,
  RNStylexProvider,
  createThemes,
} from '@mochi-inc-japan/react-native-stylex-sheet';
import type { RNStyle } from '@mochi-inc-japan/react-native-stylex-sheet';

export const media = defineVars({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
  xl: '(width >= 1284px)',
  xxl: '(width >= 1536px)',
});

export const { themes } = createThemes(['light', 'dark']);

export const vars = defineVars({
  // Base palette
  colorBlue100: '#ab9cf7',
  colorBlue500: '#301b96',
  colorBlue900: '#0D0630',
  colorGreen100: '#d9fff6',
  colorGreen500: '#8BBEB2',
  colorGreen900: '#384d48',
  colorBlack: '#000000',
  colorWhite: '#ffffff',
  colorGray50: '#f2f2f7',
  colorGray100: '#e5e5ea',
  colorGray200: '#d1d1d6',
  colorGray300: '#c7c7cc',
  colorGray400: '#aeaeb2',
  colorGray500: '#8e8e93',
  colorGray600: '#636366',
  colorGray700: '#48484a',
  colorGray800: '#3a3a3c',
  colorGray850: '#2c2c2e',
  colorGray900: '#1d1d1f',
  // Brand
  primary: '#301b96',
  primaryText: '#0D0630',
  primaryMuted: '#ab9cf7',
  secondary: '#8BBEB2',
  secondaryText: '#384d48',
  secondaryMuted: '#d9fff6',
  // Informative
  info: '#3B82F6',
  infoText: '#0A45A6',
  infoMuted: '#cfdef7',
  success: '#10B981',
  successText: '#06734E',
  successMuted: '#cee8df',
  warn: '#FBBF24',
  warnText: '#8a6200',
  warnMuted: '#f3ead1',
  error: '#EF4444',
  errorText: '#8C0606',
  errorMuted: '#f3d2d3',
  // General
  text: '#000000',
  textInverted: '#ffffff',
  border: 'rgba(150, 150, 150, 0.3)',
  backdrop: 'rgba(0,0,0,0.5)',
  background: '#ffffff',
  surface: '#ffffff',
  elevated: '#ffffff',
  muted1: '#8e8e93',
  muted2: '#aeaeb2',
  muted3: '#c7c7cc',
  muted4: '#d1d1d6',
  muted5: '#e5e5ea',
  muted6: '#f2f2f7',
  // Space
  spaceNone: 0,
  space1: 4,
  space2: 8,
  space3: 16,
  space4: 24,
  space5: 32,
  space6: 40,
  space7: 56,
  space8: 72,
  space9: 96,
  // Radii
  radiiSm: 4,
  radiiMd: 8,
  radiiLg: 24,
  radiiFull: 999,
  // Border widths
  borderWidthThin: StyleSheet.hairlineWidth,
  borderWidthNormal: 1,
  borderWidthThick: 2,
  // Font sizes
  fontSizeXxs: 10,
  fontSizeXs: 14,
  fontSizeSm: 16,
  fontSizeMd: 18,
  fontSizeLg: 20,
  fontSizeXl: 24,
  fontSizeXxl: 32,
  // Line heights
  lineHeightXxs: 12,
  lineHeightXs: 16,
  lineHeightSm: 18,
  lineHeightMd: 20,
  lineHeightLg: 24,
  lineHeightXl: 28,
  lineHeightXxl: 36,
  // Misc
  hairlineWidth: StyleSheet.hairlineWidth,
});

type PropArg = Parameters<typeof props>[number] | false | null | undefined;

export function useStylex() {
  const sx = _useStylex();
  return {
    ...sx,
    props: (...args: PropArg[]) =>
      props(...(args.filter(Boolean) as Parameters<typeof props>)),
  };
}

export { create, props, mix, RNStylexProvider };
