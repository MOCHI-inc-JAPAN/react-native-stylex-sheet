import {
  Children,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
import { mix, props } from './base';
import { RNStyle, VariantStyleSheet } from './types';

type IApi = {
  props: typeof props;
  mix: typeof mix;
};

type UserConfig = {
  width: number;
  theme: string;
};

type ValueType = UserConfig & IApi;

const RNStyleXContext = createContext<ValueType | undefined>(undefined);

export const RNStyleXProvider = (
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
      props(...args) {
        const sheets = args.map((v) => (Array.isArray(v) ? v : v && this.mix(v as VariantStyleSheet<string, RNStyle> )))
        return props(...sheets);
      },
      mix(arg, variants) {
        const config = {
          theme,
          media: correctedWidth,
        };
        if (Array.isArray(arg)) {
          return mix([arg[0], { ...config, ...arg[1] }], variants);
        }
        return mix([arg, config], variants);
      },
    }),
    [correctedWidth, theme]
  );
  return createElement(
    RNStyleXContext.Provider,
    { value },
    Children.only(componentProps.children)
  );
};

export const useStylex = () => {
  const context = useContext(RNStyleXContext);
  if (!context) {
    throw new Error('useStylex must be used within a RNStyleXProvider');
  }
  return context;
};
