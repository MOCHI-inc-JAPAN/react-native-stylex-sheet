import {
  Children,
  createContext,
  createElement,
  useContext,
  useMemo,
} from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
import { mix, props } from './base';

type IApi = {
  props: typeof props;
  mix: typeof mix;
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
      props,
      mix: (arg, variants) => {
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
