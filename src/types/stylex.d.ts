/* eslint-disable */
import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ThemeToken, VarsGroup, ThemeOverride } from './tokens';
import type * as CSSUtil from './css-util';
import type * as Util from './util';

export type { ThemeToken, VarsGroup, ThemeOverride };

/** A handle returned by create() for a single style definition. */
export interface StyleEntry {}

/** Input accepted by props() — falsy values are silently ignored. */
export type StyleItem = StyleEntry | null | false | undefined;

/** Variant prop values — supports responsive objects with @initial / @<mediaKey>. */
type VariantValue<V, Media> =
  | V
  | ({ '@initial'?: V } & { [KMedia in Util.Prefixed<'@', keyof Media>]?: V });

/** CSS style value: a raw primitive or a ThemeToken from defineVars(). */
type TokenOrValue = string | number | boolean | ThemeToken;

/** The StyleX-like API object returned by createStylex(). */
export default interface StylexInterface<
  Media extends {} = {},
  Utils extends {} = {}
> {
  /**
   * Define styles. Call at module level (outside components).
   * Supports variants, compoundVariants, and defaultVariants per entry.
   * Style values may be ThemeTokens from defineVars() for theme-reactive values.
   */
  create<
    Defs extends Record<
      string,
      Record<string, any> & {
        variants?: {
          [Name in string]: { [Pair in number | string]: Record<string, any> };
        };
        compoundVariants?: (Record<string, string | number> & {
          css: Record<string, any>;
        })[];
        defaultVariants?: { [K in string]?: string };
      }
    >
  >(
    styleDefs: Defs
  ): { [K in keyof Defs]: StyleEntry };

  /**
   * Resolve one or more StyleEntry objects into { style } props.
   * Falsy items (null, false, undefined) are skipped.
   * Uses default token values and reads device dimensions synchronously (non-reactive).
   * For theme/media reactivity, use useStylex().props() instead.
   *
   * @example
   * <View {...stylex.props(styles.base, isHighlighted && styles.highlighted)} />
   */
  props(...styles: StyleItem[]): { style: StyleProp<ViewStyle> };

  /**
   * React hook returning a media- and theme-reactive props function.
   * Must be called inside a component. Uses ThemeProvider context for active theme.
   *
   * @example
   * function MyComp({ highlight }) {
   *   const sx = useStylex();
   *   return <View {...sx.props(styles.base, highlight && styles.highlighted)} />;
   * }
   */
  useStylex(): {
    props(...styles: StyleItem[]): { style: StyleProp<ViewStyle> };
  };

  /**
   * Define a group of theme variables with default values.
   * Returns ThemeToken objects that can be used as style values in create().
   *
   * @example
   * const vars = stylex.defineVars({ primaryColor: 'blue', spacing: 8 });
   * const styles = stylex.create({ box: { color: vars.primaryColor } });
   */
  defineVars<T extends Record<string, string | number>>(defaults: T): VarsGroup<T>;

  /**
   * Define non-overridable constants. Returns a frozen copy.
   *
   * @example
   * const consts = stylex.defineConsts({ maxWidth: 1200 });
   */
  defineConsts<T extends Record<string, string | number | boolean>>(
    consts: T
  ): Readonly<T>;

  /**
   * Create a theme override for a VarsGroup.
   * Pass the result to ThemeProvider to apply the overrides.
   *
   * @example
   * const darkTheme = stylex.createTheme(vars, { primaryColor: 'navy' });
   * <ThemeProvider theme={darkTheme}><App /></ThemeProvider>
   */
  createTheme<T extends VarsGroup<Record<string, string | number>>>(
    vars: T,
    overrides: { [K in keyof T]: string | number }
  ): ThemeOverride;

  /**
   * Provides a ThemeOverride to all descendant components using useStylex().
   * If no theme is provided, token defaults are used.
   */
  ThemeProvider: React.FunctionComponent<{
    theme?: ThemeOverride | null;
    children: React.ReactNode;
  }>;

  media: Media;
  utils: Utils;
}
