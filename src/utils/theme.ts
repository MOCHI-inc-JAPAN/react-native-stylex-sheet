import { createVariantKey } from './variant';
import { create } from './base';
import { StyleSheet } from 'react-native';
import { NamedStyles, RNStyle, VariantKey, XRNStyleSheets } from './types';

export const getThemeKey = <T extends string>(theme: T): VariantKey<'@theme', T> => createVariantKey('@theme', theme);

type AllowNoKeyAccessObject<R extends Record<string, any>> = {
  [K in keyof R]: R[K];
} & { [key: string]: undefined };

export function createThemes<
  const T extends string[],
>(
  themes: T,
): {
  themes: AllowNoKeyAccessObject<{
    [K in T[number]]: VariantKey<'@theme', K>;
  }>
  defineThemes: <R extends RNStyle = RNStyle>(args: NamedStyles<{
    [K in  VariantKey<'@theme', T[number]>]?: R
  }>) => XRNStyleSheets<NamedStyles<any, R>, R>
  themeStyleSheets: <X extends StyleSheet.NamedStyles<{ [key in VariantKey<'@theme', T[number]>]?: RNStyle }>>(args: X)
    => X & {[key: string | symbol | number]: undefined}
} {
  if (new Set(themes).size !== themes.length) {
    throw new Error('Themes must be unique');
  }
  const themesObj = themes.reduce((current, theme) => {
    current[theme as T[number]] = getThemeKey(theme);
    return current;
  }, {} as { [K in T[number]]: string });
  return {
    themes: themesObj as AllowNoKeyAccessObject<{
      [K in T[number]]: VariantKey<'@theme', K>;
    }>,
    defineThemes: create as any,
    themeStyleSheets: StyleSheet.create as any
  };
}
