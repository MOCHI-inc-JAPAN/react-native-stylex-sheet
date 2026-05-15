import { RNStyle, VariantStyleSheet } from './types';
import { createVariantKey } from './variant';

export const getThemeKey = (theme: string) => createVariantKey('@theme', theme);

export const resolveTheme = <
  T extends VariantStyleSheet<any, RNStyle> = VariantStyleSheet<any, any>
>(
  target: T,
  themeKey: string
) => target[themeKey];

export function createThemes<
  const T extends string[]
>(
  themes: T
): { themes: Record<T[number], string> } {
  if (new Set(themes).size !== themes.length) {
    throw new Error('Themes must be unique');
  }
  const themesObj = themes.reduce((current, theme) => {
    current[theme as T[number]] = getThemeKey(theme);
    return current;
  }, {} as Record<T[number], string>);
  return {
    themes: themesObj,
  };
}
