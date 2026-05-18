import { StyleSheet } from 'react-native';
import {
  XRNStyleSheets,
  XRNStyle,
  NamedStyles,
  RNStyle,
  VariantStyleSheet,
} from './types';
import { media } from './media';
import { variants } from './variant';
import { resolveTheme } from './theme-helper';

const __isXRNStyle = Symbol('__isXRNStyle');

export const isXRNStyle = (style: any): style is XRNStyle<RNStyle> => {
  return style && style[__isXRNStyle];
}

type BundleStyleSheet<S extends XRNStyle<any>>  = StyleSheet.NamedStyles<
  Record<keyof S, RNStyle>
>

function bundleStyleSheet<S extends RNStyle>(
  styleObject: XRNStyle<S>
): BundleStyleSheet<typeof styleObject> & { [key in symbol]: true} {
  const result = Object.entries(styleObject).reduce((current, [key, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([variantKey, variantValue]) => {
        if (!current[variantKey]) {
          current[variantKey] = {};
        }
        (current[variantKey] as any)[key] = variantValue;
      });
    } else {
      current.default ||= {};
      (current.default as any)[key] = value;
    }
    return current;
  }, {} as Record<string, RNStyle>);
  const bundled = StyleSheet.create(result);
  (bundled as any)[__isXRNStyle] = true;
  return bundled as BundleStyleSheet<typeof styleObject> & { [key in symbol]: true };
}

export const create = <R extends RNStyle, const T extends NamedStyles<any, R> = NamedStyles<any, R>>(
  args: T
): XRNStyleSheets<T, R> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    (current as any)[key] = bundleStyleSheet(value);
    return current;
  }, {}) as XRNStyleSheets<T, R>;
};

export const mix = <
  Variants extends { [key: string]: string | number | boolean | undefined },
  Theme extends string = string,
  T extends VariantStyleSheet<string, RNStyle> = VariantStyleSheet<
    string,
    RNStyle
  >
>(
  target?: T | [T, { theme?: Theme; media?: number | string }],
  variantArgs?: Variants
): RNStyle[] => {
  if (!target) return [];
  const [_target, config] = Array.isArray(target) ? target : [target as T, {}];
  let results = _target.default ? [_target.default] : ([] as RNStyle[]);
  if (config.theme) {
    const themeSheet = resolveTheme(_target, config.theme);
    themeSheet && results.push(themeSheet);
  }
  if (config.media) {
    results = [...results, ...media(_target, config.media)];
  }
  if (variantArgs) {
    results = [...results, ...variants(_target, variantArgs)];
  }
  return results;
};

export const flatten =  <T extends RNStyle>(
  ...args: (PropValue | RNStyle[])[]
): T => {
  return StyleSheet.flatten(props(...args).style) as T;
};

type PropValue = false | null | undefined |VariantStyleSheet<string, RNStyle> | RNStyle;
export const props = <T extends RNStyle>(
  ...args: (PropValue | RNStyle[])[]
): { style: T[] } => {
  return {
    style: args.reduce((acc: T[], arg) => {
      if (!arg) return acc;
      if (Array.isArray(arg)) {
        return [...acc, ...arg] as T[];
      }
      const xStyleBase =
        (arg as VariantStyleSheet<string, RNStyle>).default ?? arg;
      return [...acc, xStyleBase] as T[];
    }, []) as T[],
  };
};
