import { PixelRatio, useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { media } from './media';
import { RNStyle, VariantStyleSheet } from './types';

export const useMedia = () => {
  const { width } = useWindowDimensions();
  const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
  return useMemo(
    () => ({
      media: <T extends VariantStyleSheet<string, RNStyle>>(target: T) =>
        media(target, correctedWidth),
    }),
    [correctedWidth]
  );
};
