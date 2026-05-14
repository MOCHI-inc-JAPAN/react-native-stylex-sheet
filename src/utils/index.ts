import { StyleSheet } from 'react-native';
import {
  XRNStyleSheets,
  XRNStyle,
  NamedStyles,
  RNStyle,
  VariantStyleSheet,
} from './types';

function bundleStyleSheet<S extends RNStyle>(styleObject: XRNStyle<S>) {
  const result = Object.entries(styleObject).reduce(
    (current, [key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([variantKey, variantValue]) => {
          if (!current[variantKey]) {
            current[variantKey] = {};
          }
          (current[variantKey] as any)[key] = variantValue;
        });
      } else {
        (current.default as any)[key] = value;
      }
      return current;
    },
    {
      default: {},
    } as Record<string, RNStyle>
  );
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

export const createVariants = <
  K extends string,
  A extends Record<string, RNStyle>
>(
  variantKey: K,
  args: A
): Record<`@${K}_${keyof A & string}`, RNStyle> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    current[`@${variantKey}_${key}`] = value;
    return current;
  }, {} as Record<`@${K}_${keyof A & string}`, RNStyle>);
};

export const variants = <
  T extends VariantStyleSheet<any, RNStyle>,
  V extends Record<string, string>
>(
  target: T,
  variants: V
): T[keyof T][] => {
  for (const [variantKey, variantValue] of Object.entries(variants)) {
    const result = target[`@${variantKey}_${variantValue}`];
    if (result) {
      return [target.default, result] as T[keyof T][];
    }
  }
  return [target.default] as T[keyof T][];
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
