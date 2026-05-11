import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import type { ThemeToken } from './tokens';

export type RNStyle = ViewStyle | TextStyle | ImageStyle;

/** `@<mediaKey>` string prefix helper. */
export type Prefixed<K extends string, T> = `${K}${Extract<
  T,
  boolean | number | string
>}`;

/** Adds ThemeToken as a valid value for string/number properties. Distributes over unions. */
type WithToken<T> = T extends string | number ? T | ThemeToken : T;

/**
 * React Native style properties with optional ThemeToken support.
 * Maps over TextStyle (superset of ViewStyle) and ImageStyle.
 */
export type TokenizedStyleProps = {
  [K in keyof TextStyle]?: WithToken<NonNullable<TextStyle[K]>>;
} &
  { [K in keyof ImageStyle]?: WithToken<NonNullable<ImageStyle[K]>> };

/** Util invocation props: key = util name, value = argument passed to the util function. */
type UtilStyleProps<Utils extends object> = {
  [KUtil in keyof Utils]?: Utils[KUtil] extends (value: infer V) => any
    ? V
    : never;
};

/**
 * A flat style definition accepted by create():
 * - React Native style properties (values may be ThemeToken)
 * - Media query nesting via `@<mediaKey>: TokenizedStyleProps`
 * - Util invocations via `utilName: value`
 */
export type FlatStyleDef<
  Media extends object,
  Utils extends object
> = TokenizedStyleProps &
  { [KMedia in Prefixed<'@', keyof Media>]?: TokenizedStyleProps } &
  UtilStyleProps<Utils>;

/**
 * A single entry in create(): flat styles plus the optional variant system.
 * Keys in compoundVariants other than `css` are variant selectors.
 */
export type StyleEntryDef<
  Media extends object,
  Utils extends object
> = FlatStyleDef<Media, Utils> & {
  variants?: {
    [Name in string]: {
      [Pair in string | number]: FlatStyleDef<Media, Utils>;
    };
  };
  compoundVariants?: {
    css: FlatStyleDef<Media, Utils>;
    [variantKey: string]: string | number | FlatStyleDef<Media, Utils>;
  }[];
  defaultVariants?: { [K in string]?: string | number };
};

/** Constrains the media config object. */
export type MediaConfig<T extends object = object> = {
  [name in keyof T]: T[name] extends string ? T[name] : string | boolean;
};

/**
 * Constrains the utils config object: each value must be a function.
 * The identity union `T[Property] | (...)` lets TypeScript infer T from callers
 * without triggering a circular constraint error.
 */
export type UtilsConfig<T extends object = object> = {
  [Property in keyof T]: T[Property] extends (value: infer V) => any
    ? T[Property] | ((value: V) => Record<string, any>)
    : never;
};
