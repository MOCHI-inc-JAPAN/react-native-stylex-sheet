/* eslint-disable */
import type StylexInterface from './stylex';
import type * as Config from './config';
import type * as CSSUtil from './css-util';

export type CreateStylex = Config.CreateStylex;
export type CSSProperties = CSSUtil.CSSProperties;
export type DefaultThemeMap = Config.DefaultThemeMap;

export type { StyleEntry, VariantSpec, StyleInput } from './stylex';

/** Returns a Style interface from a configuration, leveraging the given media and style map. */
export type CSS<
  Cfg extends {
    media?: {};
    theme?: {};
    themeMap?: {};
    utils?: {};
  } = {
    media: {};
    theme: {};
    themeMap: {};
    utils: {};
  }
> = CSSUtil.CSS<
  Cfg['media'],
  Cfg['theme'],
  Cfg['themeMap'],
  Cfg['utils']
>;

/** Returns the properties, attributes, and children expected by a component. */
export type ComponentProps<Component> = Component extends (
  ...args: any[]
) => any
  ? Parameters<Component>[0]
  : never;

/** Returns a type that expects a value to be a kind of CSS property value. */
export type PropertyValue<K extends keyof CSSUtil.CSSProperties> = {
  readonly [CSSUtil.$$PropertyValue]: K;
};

/** Returns a type that expects a value to be a kind of theme scale value. */
export type ScaleValue<K> = { readonly [CSSUtil.$$ScaleValue]: K };

/**
 * Extracts variant props from a StyleEntry returned by `create()`.
 *
 * @example
 * const styles = stylex.create({ button: { variants: { size: { sm: {...}, lg: {...} } } } });
 * type ButtonVariants = VariantProps<typeof styles.button>;
 * // => { size?: 'sm' | 'lg' | ResponsiveVariant<...> }
 */
export type VariantProps<
  Entry extends StylexInterface['create'] extends (d: any) => infer R
    ? R[keyof R]
    : never
> = Entry extends import('./stylex').StyleEntry<infer V>
  ? { [K in keyof V]?: keyof V[K] | string }
  : {};

/** Map of CSS properties to token scales. */
export declare const defaultThemeMap: DefaultThemeMap;

/** Creates a StyleX-like styling API configured with themes, media, and utils. */
export declare const createStylex: CreateStylex;

/** Returns a StyleEntry map from style definitions (from the default no-config instance). */
export declare const create: StylexInterface['create'];

/** Resolves a StyleEntry or VariantSpec to `{ style }` props (from the default no-config instance). */
export declare const props: StylexInterface['props'];

/** Wraps a StyleEntry with variant props (from the default no-config instance). */
export declare const variants: StylexInterface['variants'];

/** Hook returning theme-reactive `{ props, variants }` (from the default no-config instance). */
export declare const useStylex: StylexInterface['useStylex'];
