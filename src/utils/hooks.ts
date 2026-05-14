import { PixelRatio, useWindowDimensions } from 'react-native';
import {
  Children,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';
import { media } from './media';
import { RNStyle, VariantStyleSheet } from './types';
import { create, props, variants, createVariants } from './base';
import { defineConsts, defineVars } from './tokens';

type IApi = {
  media: <T extends VariantStyleSheet<string, RNStyle>>(
    target: T
  ) => T[keyof T][];
  create: typeof create;
  props: typeof props;
  variants: typeof variants;
  createVariants: typeof createVariants;
  defineConsts: typeof defineConsts;
  defineVars: typeof defineVars;
};

type UserConfig = {
  width: number;
  theme: string;
};

type ValueType = UserConfig & IApi;

const RNStylexContext = createContext<ValueType | undefined>(undefined);

export const RNStylexProvider = (
  componentProps: Partial<Pick<ValueType, 'width' | 'theme'>> & {
    children: React.ReactNode;
  }
) => {
  const { width } = useWindowDimensions();
  const correctedWidth =
    componentProps.width ?? PixelRatio.getPixelSizeForLayoutSize(width);
  const theme = componentProps.theme ?? 'default';
  const value = useMemo<ValueType>(
    () => ({
      width: correctedWidth,
      theme,
      media: <T extends VariantStyleSheet<string, RNStyle>>(target: T) =>
        media(target, correctedWidth),
      create,
      props,
      variants,
      createVariants,
      defineConsts,
      defineVars,
    }),
    [correctedWidth, theme]
  );
  return createElement(
    RNStylexContext.Provider,
    { value },
    Children.only(componentProps.children)
  );
};

export const useStylex = () => {
  const context = useContext(RNStylexContext);
  if (!context) {
    throw new Error('useStylex must be used within a RNStylexProvider');
  }
  return context;
};
