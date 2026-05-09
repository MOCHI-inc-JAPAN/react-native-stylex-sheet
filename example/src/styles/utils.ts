import { CSSProperties } from 'react';
import { StyleSheet } from 'react-native';

export type TypographyVariant =
  | 'body'
  | 'bodySmall'
  | 'bodyExtraSmall'
  | 'title1'
  | 'title2'
  | 'title3';

type TypographyVariantVar = `$${TypographyVariant}`;

const typographyVariants: { [variant in TypographyVariantVar]: CSSProperties } = {
  $title1: { fontSize: 32, fontWeight: '700' },
  $title2: { fontSize: 24, fontWeight: '700' },
  $title3: { fontSize: 20, fontWeight: '700' },
  $body: { fontSize: 18, fontWeight: '400' },
  $bodySmall: { fontSize: 16, fontWeight: '400' },
  $bodyExtraSmall: { fontSize: 14, fontWeight: '500' },
};

export const typography = (value: TypographyVariantVar) => typographyVariants[value];

export const size = (value: number | string) => ({ width: value, height: value });

export const shadow = (level: 'none' | 'small' | 'medium' | 'large') =>
  ({
    none: {
      elevation: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowOpacity: 0,
      shadowColor: '#000',
    },
    small: {
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
      shadowOpacity: 0.1,
      shadowColor: '#000',
    },
    medium: {
      elevation: 5,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 6,
      shadowOpacity: 0.2,
      shadowColor: '#000',
    },
    large: {
      elevation: 10,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      shadowOpacity: 0.4,
      shadowColor: '#000',
    },
  })[level];

export const flexCenter = (
  value?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
) => ({
  flexDirection: value || 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

export const absoluteFill = () => ({ ...StyleSheet.absoluteFillObject });

const fontSizes = { xxl: 32, xl: 24, lg: 20, md: 18 };

export const remFunction =
  <Property extends keyof CSSProperties>(property: Property) =>
  (rValue: number): any => ({
    '@xxl': { [property]: fontSizes.xxl * rValue },
    '@xl': { [property]: fontSizes.xl * rValue },
    '@lg': { [property]: fontSizes.lg * rValue },
    '@md': { [property]: fontSizes.md * rValue },
  });
