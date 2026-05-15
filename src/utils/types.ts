import type { StyleSheet } from 'react-native';

export type StyleObject = StyleSheet.NamedStyles<any>;
export type RNStyle = StyleObject[string];

export type VariantStyle<S> = { [key: string]: S };
export type VariantStyleSheet<Key extends string, S extends RNStyle> = {
  [key in Key]: S;
};

export type XRNStyle<S extends RNStyle = RNStyle> = {
  [key in keyof S]: VariantStyle<S[key]> | S[key];
};

type ExtractVariantKeys<
  X extends XRNStyle<S>,
  S extends RNStyle = RNStyle
> = Extract<keyof Extract<X[keyof X], VariantStyle<any>>, string>;

export type NamedStyles<T = string, R extends RNStyle = RNStyle> = {
  [P in keyof T]: XRNStyle<R>;
};

export type XRNStyleSheets<
  X extends NamedStyles<any, S>,
  S extends RNStyle = RNStyle
> = {
  [key in keyof X]: VariantStyleSheet<ExtractVariantKeys<X[key]>, S>;
};

type ExtractPostFix<T extends string> = T extends `@${string}_${infer PostFix}`
  ? PostFix
  : 'default';

export type Variants<
  A extends Record<string, Record<string, Record<string, any>>>
> = {
  [key in keyof A]?: ExtractPostFix<Extract<keyof A[key][keyof A[key]], string>>;
};

export type VariantValue<S extends RNStyle = RNStyle> = {
  [key in keyof S]: VariantStyle<S[key]>;
}; // Style Fields
