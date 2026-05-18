import { RNStyle, VariantStyleSheet } from './types';

export const resolveTheme = <
  T extends VariantStyleSheet<any, RNStyle> = VariantStyleSheet<any, any>
>(
  target: T,
  themeKey: string
) => target[themeKey];
