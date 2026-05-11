let _id = 0;
function nextId(): string {
  return `_${++_id}`;
}

export type ThemeToken<T extends string | number = string | number> = {
  readonly __stylex_var__: true;
  readonly __varId: string;
  readonly __default: T;
};

export type VarsGroup<
  T extends Record<string, string | number> = Record<string, string | number>
> = {
  readonly [K in keyof T]: ThemeToken<T[K]>;
};

export type ThemeOverride = {
  readonly __stylex_theme__: true;
  readonly __themeId: string;
  readonly __tokenValues: Record<string, string | number>;
};

export function isThemeToken(val: unknown): val is ThemeToken {
  return (
    val !== null &&
    typeof val === 'object' &&
    (val as Record<string, unknown>).__stylex_var__ === true
  );
}

export function defineVars<T extends Record<string, string | number>>(
  defaults: T
): VarsGroup<T> {
  const groupId = nextId();
  const out: Record<string, ThemeToken> = {};
  for (const [k, v] of Object.entries(defaults)) {
    out[k] = Object.freeze({
      __stylex_var__: true as const,
      __varId: `${groupId}_${k}`,
      __default: v,
    });
  }
  return Object.freeze(out) as VarsGroup<T>;
}

export function defineConsts<
  T extends Record<string, string | number | boolean>
>(consts: T): Readonly<T> {
  return Object.freeze({ ...consts });
}

export function createTheme<
  T extends VarsGroup<Record<string, string | number>>
>(vars: T, overrides: { [K in keyof T]: string | number }): ThemeOverride {
  const themeId = nextId();
  const tokenValues: Record<string, string | number> = {};
  for (const [k, token] of Object.entries(vars)) {
    const t = token as ThemeToken;
    tokenValues[t.__varId] =
      (overrides as Record<string, string | number>)[k] ?? t.__default;
  }
  return Object.freeze({
    __stylex_theme__: true as const,
    __themeId: themeId,
    __tokenValues: tokenValues,
  });
}
