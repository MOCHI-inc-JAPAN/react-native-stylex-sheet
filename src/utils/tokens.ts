export function defineVars<T extends Record<string, string | number>>(
  defaults: T
) {
  return Object.freeze({ ...defaults });
}

// NOTE: RNでは、build前compileがないので、defineConstsはdefineVarsのAliasとして扱う
export function defineConsts<
  T extends Record<string, string | number | boolean>
>(consts: T): Readonly<T> {
  return Object.freeze({ ...consts });
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
