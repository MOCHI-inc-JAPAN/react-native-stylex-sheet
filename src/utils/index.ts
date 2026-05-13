import { StyleSheet } from 'react-native';

type StyleObject = StyleSheet.NamedStyles<any>;
type RNStyle = StyleObject[string];

type VariantsKey = string | 'default';

type StyleSheetValue = ReturnType<typeof StyleSheet.create>;
type StyleValue = StyleSheetValue[string];

export type XRNStyle<S extends RNStyle = RNStyle> =
  | RNStyle
  | { [key in keyof S]: Record<VariantsKey, S[key]> };

type NamedStyles<T> = { [P in keyof T]: XRNStyle };

type InternalCreateResult<T extends NamedStyles<any>> = Record<
  keyof T,
  Record<VariantsKey, StyleValue>
>;

function bundleStyleSheet(styleObject: XRNStyle): StyleSheetValue {
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
    } as Record<VariantsKey, StyleValue>
  );
  return StyleSheet.create(result);
}

export const create = <T extends NamedStyles<any>>(
  args: NamedStyles<T> | NamedStyles<any>
): InternalCreateResult<T> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    (current as any)[key] = bundleStyleSheet(value);
    return current;
  }, {} as InternalCreateResult<T>);
};

export const createVariants = <
  K extends string,
  A extends Record<string, StyleValue>
>(
  variantKey: K,
  args: A
): Record<`@${K}_${keyof A & string}`, StyleValue> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    current[`@${variantKey}_${key}`] = value;
    return current;
  }, {} as Record<`@${K}_${keyof A & string}`, StyleValue>);
};

export const variants = <T extends Record<VariantsKey, StyleValue>>(
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

type PropValue = Record<VariantsKey, StyleValue> | StyleValue;
export const props = <T extends RNStyle>(
  ...args: (PropValue | StyleValue[])[]
): { style: T[] } => {
  return {
    style: args.reduce((acc: T[], arg) => {
      const xStyleBase = (arg as Record<VariantsKey, StyleValue>).default;
      if (xStyleBase) {
        return [...acc, xStyleBase] as T[];
      }
      if (Array.isArray(arg)) {
        return [...acc, ...arg] as T[];
      }
      return [...acc, arg as StyleValue] as T[];
    }, []) as T[],
  };
};
