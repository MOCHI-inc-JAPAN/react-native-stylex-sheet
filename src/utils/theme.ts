import { createVariants, createVariantKey } from './variant';
import { RNStyle, VariantValue } from './types';

export const getThemeKey = (theme: string) => createVariantKey('@theme', theme);

export function setupThemes<T extends string[]>(themes: T) {
  if (new Set(themes).size !== themes.length) {
    throw new Error('Themes must be unique');
  }
  const createTheme = <S extends RNStyle>(arg: VariantValue<S>) => {
    return createVariants({
      '@theme': arg,
    });
  };
  const themesObj = themes.reduce((current, theme) => {
    current[theme as T[number]] = getThemeKey(theme);
    return current;
  }, {} as Record<T[number], string>);
  return {
    createTheme,
    themes: themesObj,
  };
}
