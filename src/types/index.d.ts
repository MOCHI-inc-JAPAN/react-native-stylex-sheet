/* eslint-disable */
import type StylexInterface from './stylex';
import type * as Config from './config';
import type * as CSSUtil from './css-util';

export type CreateStylex = Config.CreateStylex;
export type CSSProperties = CSSUtil.CSSProperties;

export type { ThemeToken, VarsGroup, ThemeOverride, StyleEntry, StyleItem } from './stylex';

/** Returns a Style interface from a configuration, leveraging the given media and style map. */
export type CSS<
  Cfg extends {
    media?: {};
    utils?: {};
  } = {
    media: {};
    utils: {};
  }
> = CSSUtil.CSS<Cfg['media'], {}, {}, Cfg['utils']>;

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

/** Creates a StyleX-like styling API configured with media and utils. */
export declare const createStylex: CreateStylex;

/** Returns a StyleEntry map from style definitions (from the default no-config instance). */
export declare const create: StylexInterface['create'];

/**
 * Resolve one or more StyleEntry objects into { style } props.
 * From the default no-config instance.
 */
export declare const props: StylexInterface['props'];

/** Hook returning media-reactive { props } (from the default no-config instance). */
export declare const useStylex: StylexInterface['useStylex'];

/**
 * Define a group of theme variables with default values.
 * Returns ThemeToken objects for use as style values in create().
 */
export declare const defineVars: StylexInterface['defineVars'];

/**
 * Define non-overridable constants. Returns a frozen copy.
 */
export declare const defineConsts: StylexInterface['defineConsts'];

/**
 * Create a theme override for a VarsGroup.
 * Pass the result to ThemeProvider to activate the override.
 */
export declare const createTheme: StylexInterface['createTheme'];
