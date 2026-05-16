import type {
  RNStyle,
  VariantStyle,
  VariantStyleSheet,
  VariantValue,
} from './types';

type CreateVariantValueOutput<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  K extends string,
  A extends VariantStyle<any>
> = {
  [key in keyof A as key extends 'default'
    ? 'default'
    : `@${K}_${key & string}`]: A[key];
};

export const createVariantKey = (variantKey: string, key: string) =>
  `@${variantKey}_${key}`;

export const createVariantValue = <
  K extends string,
  A extends VariantStyle<any>
>(
  variantKey: K,
  args: A
): CreateVariantValueOutput<K, A> => {
  return Object.entries(args).reduce((current, [key, value]) => {
    if (key === 'default') {
      (current as any).default = value;
    } else {
      (current as any)[createVariantKey(variantKey, key)] = value;
    }
    return current;
  }, {} as CreateVariantValueOutput<K, A>);
};

type VariantArg<S extends RNStyle = RNStyle> = Record<
  string, // variantKey
  VariantValue<S>
>;

type VariantsOutput<
  A extends Record<string, Record<string, Record<string, any>>>
> = {
  [key in Extract<keyof A, string>]: {
    [subKey in keyof A[key]]: CreateVariantValueOutput<key, A[key][subKey]>;
  };
};

/**
 * INPUT;
 *  {
 *    shape: {
 *      borderRadius: {
 *        default: 4,
 *        round: 8,
 *        square: 0,
 *      },
 *      fontSize: {
 *        default: 14,
 *        round: 16,
 *        square: 18,
 *      }
 *    }
 *  }
 * OUTPUT;
 *  {
 *    shape: {
 *      borderRadius: {
 *        default: 4,
 *        @shape_round: 8,
 *        @shape_square: 0,
 *      },
 *      fontSize: {
 *        default: 14,
 *        @shape_round: 16,
 *        @shape_square: 18,
 *      }
 *    }
 *  }
 **/
export const createVariants = <A extends VariantArg>(
  args: A
): VariantsOutput<A> => {
  return Object.entries(args).reduce((current, [variantKey, value]) => {
    current[variantKey] ||= {};
    Object.entries(value).forEach(([styleField, variantValue]) => {
      current[variantKey][styleField] = createVariantValue(
        variantKey,
        variantValue
      );
    });
    return current;
  }, {} as Record<string, any>) as VariantsOutput<A>;
};

export const variants = <
  V extends {[key: string]: string | undefined},
  T extends VariantStyleSheet<any, RNStyle> = VariantStyleSheet<any, any>
>(
  target: T,
  variants: V
): T[keyof T][] => {
  const results = [] as T[keyof T][];
  for (const [variantKey, variantValue] of Object.entries(variants)) {
    if (variantValue === 'default') continue;
    const nextStyle = target[`@${variantKey}_${variantValue}`];
    nextStyle && results.push(nextStyle as T[keyof T]);
  }
  return results;
};
