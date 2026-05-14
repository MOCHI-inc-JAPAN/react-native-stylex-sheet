import {
  Children,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
import { create, props, variants } from './base';
import { media } from './media';
import { RNStyle, VariantStyleSheet } from './types';

type IApi = {
  media: <T extends VariantStyleSheet<string, RNStyle>>(
    target: T
  ) => T[keyof T][];
  create: typeof create;
  props: typeof props;
  variants: typeof variants;
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
