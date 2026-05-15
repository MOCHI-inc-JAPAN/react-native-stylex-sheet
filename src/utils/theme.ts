import { createVariantValue } from './variant';
export function setupThemes<T extends string[]>(themes: T) {
  if (new Set(themes).size !== themes.length) {
    throw new Error('Themes must be unique');
  }
  const createTheme = <S extends any>(arg: Record<T[number], S>) => {
    return createVariantValue('@theme', arg);
  };
  return {
    createTheme,
  };
}
