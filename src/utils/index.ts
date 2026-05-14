import { StyleSheet } from 'react-native';
import {
  StylePropValue,
  XRNStyleSheets,
  XRNStyle,
  NamedStyles,
  RNStyle,
} from './types';

function bundleStyleSheet<S extends RNStyle>(
  styleObject: XRNStyle<S>
): XRNStyleSheets {
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
    } as Record<VariantsKey, StylePropValue>
  );
  return StyleSheet.create(result);
}

export const create = <T extends NamedStyles<any>>(
  args: NamedStyles<T> | NamedStyles<any>
): XRNStyleSheets => {
  return Object.entries(args).reduce((current, [key, value]) => {
    (current as any)[key] = bundleStyleSheet(value);
    return current;
  }, {} as XRNStyleSheets);
};

export const createVariants = <
  K extends string,
  A extends Record<string, StylePropValue>
>(
  variantKey: K,
  args: A
): Record<`@${K}_${keyof A & string}`, StylePropValue> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    current[`@${variantKey}_${key}`] = value;
    return current;
  }, {} as Record<`@${K}_${keyof A & string}`, StylePropValue>);
};

export const variants = <T extends Record<VariantsKey, StylePropValue>>(
  target: T,
  variants: {}
): T[keyof T][] => {
  for (const [variantKey, variantValue] of Object.entries(variants)) {
    const result = target[`@${variantKey}_${variantValue}`];
    if (result) {
      return [target.default, result] as T[keyof T][];
    }
  }
  return [target.default] as T[keyof T][];
};

type PropValue = Record<VariantsKey, StylePropValue> | StylePropValue;
export const props = <T extends RNStyle>(
  ...args: (PropValue | StylePropValue[])[]
): { style: T[] } => {
  return {
    style: args.reduce((acc: T[], arg) => {
      const xStyleBase = (arg as Record<VariantsKey, StylePropValue>).default;
      if (xStyleBase) {
        return [...acc, xStyleBase] as T[];
      }
      if (Array.isArray(arg)) {
        return [...acc, ...arg] as T[];
      }
      return [...acc, arg as StylePropValue] as T[];
    }, []) as T[],
  };
};
