/* eslint-disable */
import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type * as CSSUtil from './css-util';
import type * as ThemeUtil from './theme';
import type * as Util from './util';

/** Opaque symbol carrying variant types on a StyleEntry. */
declare const $$StyleEntryVariants: unique symbol;
export type $$StyleEntryVariants = typeof $$StyleEntryVariants;

/**
 * Handle returned by `create()` for a single style definition.
 * Branded with `Variants` so that `variants()` can enforce correct prop types.
 */
export interface StyleEntry<Variants extends {} = {}> {
  readonly [$$StyleEntryVariants]: Variants;
}

/** Handle returned by `variants()`. Pass to `props()` to apply variant styles. */
export interface VariantSpec {
  readonly _isVariantSpec: true;
}

/** Input accepted by `props()`. */
export type StyleInput = StyleEntry<any> | VariantSpec;

/** Variant prop values — supports responsive objects with @initial / @<mediaKey>. */
type VariantValue<V, Media> =
  | V
  | ({ '@initial'?: V } & { [KMedia in Util.Prefixed<'@', keyof Media>]?: V });

/** Props passed to `variants()` for a given variant definition. */
type VariantPropsInput<
  Variants extends Record<string, Record<string, any>>,
  Media extends {}
> = {
  [K in keyof Variants]?: VariantValue<keyof Variants[K], Media>;
};

/** Extract the variants object from a style definition. */
type ExtractVariants<T> = T extends {
  variants: infer V extends Record<string, Record<string, any>>;
}
  ? V
  : {};

/** The StyleX-like API object returned by `createStylex()`. */
export default interface Stylex<
  Media extends {} = {},
  Theme extends {} = {},
  ThemeMap extends {} = {},
  Utils extends {} = {}
> {
  config: {
    media: Media;
    theme: Theme;
    themeMap: ThemeMap;
    utils: Utils;
  };

  /**
   * Define styles. Call at module level (outside components).
   * Supports `variants`, `compoundVariants`, and `defaultVariants` per entry.
   */
  create<
    Defs extends Record<
      string,
      CSS & {
        variants?: { [Name in string]: { [Pair in number | string]: CSS } };
        compoundVariants?: (Record<string, string | number> & { css: CSS })[];
        defaultVariants?: { [K in string]?: string };
      }
    >,
    CSS = CSSUtil.CSS<Media, Theme, ThemeMap, Utils>
  >(
    styleDefs: Defs
  ): { [K in keyof Defs]: StyleEntry<ExtractVariants<Defs[K]>> };

  /**
   * Wrap a StyleEntry with variant props to apply.
   * Pass the result to `props()`.
   *
   * @example
   * stylex.props(stylex.variants(styles.button, { size: 'large' }))
   * stylex.props(stylex.variants(styles.button, { size: { '@initial': 'small', '@md': 'large' } }))
   */
  variants<V extends Record<string, Record<string, any>>>(
    entry: StyleEntry<V>,
    variantProps: VariantPropsInput<V, Media>
  ): VariantSpec;

  /**
   * Resolve a StyleEntry (or VariantSpec) into `{ style }` props.
   * Uses the default theme and reads device dimensions synchronously (non-reactive).
   * For theme/media reactivity, use `useStylex().props()` instead.
   */
  props(input: StyleInput): { style: StyleProp<ViewStyle> };

  /**
   * React hook that returns a theme- and media-reactive `{ props, variants }`.
   * Must be called inside a component. Uses ThemeProvider context for the active theme.
   *
   * @example
   * function MyComp() {
   *   const stylex = useStylex();
   *   return <View {...stylex.props(stylex.variants(styles.container, { color: 'primary' }))} />;
   * }
   */
  useStylex(): {
    props(input: StyleInput): { style: StyleProp<ViewStyle> };
    variants<V extends Record<string, Record<string, any>>>(
      entry: StyleEntry<V>,
      variantProps: VariantPropsInput<V, Media>
    ): VariantSpec;
  };

  /** The default theme definition object (for use with ThemeProvider). */
  theme: string & {
    [Scale in keyof Theme]: {
      [Token in keyof Theme[Scale]]: ThemeUtil.Token<
        Extract<Token, string | number>,
        string,
        Extract<Scale, string | void>
      >;
    };
  };

  /** Create an alternate theme. Pass the returned value to ThemeProvider. */
  createTheme: {
    <
      Arg extends {
        [Scale in keyof Theme]?: {
          [Token in keyof Theme[Scale]]?: boolean | number | string;
        };
      }
    >(
      arg: Arg
    ): string & Record<string, Record<string, any>>;
  };

  /** Provides the active theme to all descendant components using `useStylex()` or `useTheme()`. */
  ThemeProvider: React.FunctionComponent<{
    theme?: any;
    children: React.ReactNode;
  }>;

  /** Returns the resolved values of the current theme (from ThemeProvider context). */
  useTheme(): {
    [Scale in keyof Theme]: {
      [Token in keyof Theme[Scale]]: Theme[Scale][Token] extends string
        ? ThemeUtil.AliasedToken<Theme[Scale][Token]> extends never
          ? string
          : Theme[Scale][ThemeUtil.AliasedToken<Theme[Scale][Token]>]
        : Theme[Scale][Token];
    };
  };

  media: Media;
  utils: Utils;
}
