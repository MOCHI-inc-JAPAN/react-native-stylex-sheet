import { VariantStyle } from './types';

export function defineVars<
  T extends Record<string, string | number | VariantStyle<string | number>>
>(defaults: T): Readonly<T> {
  return Object.freeze({ ...defaults });
}

// NOTE: RNでは、build前compileがないので、defineConstsはdefineVarsのAliasとして扱う
export function defineConsts<
  T extends Record<string, string | number | VariantStyle<string | number>>
>(consts: T): Readonly<T> {
  return defineVars(consts);
}

export function createTheme<T extends {}>(
  vars: T,
  overrides: { [K in keyof T]: string | number }
) {
  return Object.freeze({
    ...vars,
    ...overrides,
  });
}
