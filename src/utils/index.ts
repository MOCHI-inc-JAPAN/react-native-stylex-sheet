import { StyleSheet } from 'react-native';

type StyleObject = StyleSheet.NamedStyles<any>;
type RNStyle = StyleObject[string];

export type XRNStyle<S extends RNStyle = RNStyle> =
  | RNStyle
  | { [key in keyof S]: Record<string, S[key]> };

type NamedStyles<T> = { [P in keyof T]: XRNStyle };

type InternalCreateResult = Record<
  string,
  ReturnType<typeof StyleSheet.create>
>;

export const create = <T extends NamedStyles<any>>(
  args: NamedStyles<T> | NamedStyles<any>
): T => {
  return {

  };
};

export const props = () => {};
