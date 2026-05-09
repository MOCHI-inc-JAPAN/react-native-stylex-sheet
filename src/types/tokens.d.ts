/* eslint-disable */

/** An opaque token created by defineVars(). Use as a style value to reference a theme variable. */
export type ThemeToken<T extends string | number = string | number> = {
  readonly __stylex_var__: true;
  readonly __varId: string;
  readonly __default: T;
};

/** A group of ThemeTokens returned by defineVars(). */
export type VarsGroup<
  T extends Record<string, string | number> = Record<string, string | number>
> = {
  readonly [K in keyof T]: ThemeToken<T[K]>;
};

/** An immutable theme override created by createTheme(). Pass to ThemeProvider to activate. */
export type ThemeOverride = {
  readonly __stylex_theme__: true;
  readonly __themeId: string;
  readonly __tokenValues: Record<string, string | number>;
};
