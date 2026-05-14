import { PixelRatio, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { media } from './media';
import { StylePropValue, VariantsKey } from './types';

export const useMedia = () => {
  const { width } = useWindowDimensions();
  const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
  return useMemo(
    () => ({
      media: (target: Record<VariantsKey, StylePropValue>) =>
        media(target, correctedWidth),
    }),
    [correctedWidth]
  );
};
