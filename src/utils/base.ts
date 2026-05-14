import { StyleSheet } from 'react-native';
import {
  XRNStyleSheets,
  XRNStyle,
  NamedStyles,
  RNStyle,
  VariantStyleSheet,
} from './types';

function bundleStyleSheet<S extends RNStyle>(styleObject: XRNStyle<S>) {
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
  return StyleSheet.create(result);
}

export const create = <T extends NamedStyles<any, R>, R extends RNStyle>(
  args: T
): XRNStyleSheets<T, R> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    (current as any)[key] = bundleStyleSheet(value);
    return current;
  }, {} as XRNStyleSheets<T, R>);
};

type VariantOutput<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  K extends string,
  A extends Record<string, RNStyle[keyof RNStyle]>
> = {
  [key in keyof A as key extends 'default'
    ? 'default'
    : `@${K}_${key & string}`]: A[key];
};

const createVariant = <K extends string, A extends Record<string, any>>(
  variantKey: K,
  args: A
): VariantOutput<K, A> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    if (key === 'default') {
      (current as any).default = value;
    } else {
      (current as any)[`@${variantKey}_${key}`] = value;
    }
    return current;
  }, {} as VariantOutput<K, A>);
};

type VariantsOutput<A extends Record<string, Record<string, any>>> = {
  [key in Extract<keyof A, string>]: VariantOutput<key, A[key]>;
};

export const createVariants = <A extends Record<string, Record<string, any>>>(
  args: A
): VariantsOutput<A> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    current[key] = createVariant(key, value);
    return current;
  }, {} as Record<string, any>) as VariantsOutput<A>;
};

export const variants = <
  V extends Record<string, string>,
  T extends VariantStyleSheet<any, RNStyle> = VariantStyleSheet<any, any>
>(
  target: T,
  variants: V
): T[keyof T][] => {
  const results = [] as T[keyof T][];
  if (target.default) {
    results.push(target.default as T[keyof T]);
  }
  for (const [variantKey, variantValue] of Object.entries(variants)) {
    if (variantValue === 'default') continue;
    const nextStyle = target[`@${variantKey}_${variantValue}`];
    nextStyle && results.push(nextStyle as T[keyof T]);
  }
  return results;
};

type PropValue = VariantStyleSheet<string, RNStyle> | RNStyle;
export const props = <T extends RNStyle>(
  ...args: (PropValue | RNStyle[])[]
): { style: T[] } => {
  return {
    style: args.reduce((acc: T[], arg) => {
      if (Array.isArray(arg)) {
        return [...acc, ...arg] as T[];
      }
      const xStyleBase =
        (arg as VariantStyleSheet<string, RNStyle>).default ?? arg;
      return [...acc, xStyleBase] as T[];
    }, []) as T[],
  };
};
