import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

import {
  flattenCompoundVariantStyles,
  flattenStyles,
  flattenVariantStyles,
  getCompoundKey,
} from './utils';

import { ThemeOverride, createTheme, defineConsts, defineVars } from './tokens';

import type {
  RNStyle,
  StyleEntryDef,
  MediaConfig,
  UtilsConfig,
} from './style-types';
import { resolveMediaRangeQueries } from './media';
import { createStyleSheet, processStyleSheet } from './styles';

export type { ThemeOverride, ThemeToken, VarsGroup } from './tokens';
export { createTheme, defineConsts, defineVars };

export type StyleEntry = {
  _raw: {
    styles: RNStyle;
    variants: Record<string, Record<string | number, RNStyle>>;
    compoundVariants: Array<{
      css: RNStyle;
      [variantKey: string]: string | number | RNStyle;
    }>;
    defaultVariants: Record<string, string | number>;
  };
  _sheets: Record<string, Record<string, RNStyle>>;
};

export type StyleItem = StyleEntry | null | false | undefined;

const EMPTY_TOKEN_VALUES: Record<string, string | number> = {};

function resolveVariantStylesList(
  variantProps: Record<string, any>,
  variants: Record<string, Record<string, any>>,
  defaultVariants: Record<string, string | number>,
  media: Record<string, any>,
  sheet: Record<string, any>,
  activeMediaQueries: string[]
): object[] {
  if (!variants || Object.keys(variants).length === 0) return [];

  return Object.keys(variants)
    .map((prop) => {
      let propValue = variantProps[prop];
      if (propValue === undefined) propValue = defaultVariants[prop];

      if (
        typeof propValue === 'object' &&
        propValue !== null &&
        typeof media === 'object'
      ) {
        let combined: Record<string, any> = {};
        const initial = propValue['@initial'];
        if (initial !== undefined && sheet[`${prop}_${initial}`]) {
          combined = { ...combined, ...sheet[`${prop}_${initial}`] };
        }
        activeMediaQueries.forEach((mediaKey) => {
          const value = propValue[`@${mediaKey}`];
          if (value !== undefined && sheet[`${prop}_${value}`]) {
            combined = { ...combined, ...sheet[`${prop}_${value}`] };
          }
        });
        return Object.keys(combined).length > 0 ? combined : undefined;
      }

      return sheet[`${prop}_${propValue}`];
    })
    .filter(Boolean) as object[];
}

function resolveCompoundVariantStylesList(
  variantProps: Record<string, any>,
  defaultVariants: Record<string, string | number>,
  compoundVariants: any[],
  sheet: Record<string, any>
): object[] {
  if (!compoundVariants || compoundVariants.length === 0) return [];

  return compoundVariants
    .map(({ css: _css, ...compounds }) => {
      const entries = Object.entries(compounds) as [string, any][];
      const allMatch = entries.every(
        ([prop, value]) =>
          (variantProps[prop] ?? defaultVariants[prop]) === value
      );
      if (allMatch) return sheet[getCompoundKey(entries)];
    })
    .filter(Boolean) as object[];
}

export function createStylex<
  Media extends object = object,
  Utils extends object = object
>(
  config: {
    media?: MediaConfig<Media>;
    utils?: UtilsConfig<Utils>;
  } = {}
) {
  const media = (config.media || {}) as Record<string, string | boolean>;
  const utils = (config.utils || {}) as Record<string, (v: any) => any>;

  const ThemeContext = createContext<ThemeOverride | null>(null);

  function ThemeProvider({
    theme = null,
    children,
  }: {
    theme?: ThemeOverride | null;
    children: React.ReactNode;
  }) {
    return React.createElement(
      ThemeContext.Provider,
      { value: theme },
      children
    );
  }

  function create<Defs extends Record<string, StyleEntryDef<Media, Utils>>>(
    styleDefs: Defs
  ): { [K in keyof Defs]: StyleEntry } {
    const result: Record<string, StyleEntry> = {};

    for (const [key, def] of Object.entries(
      styleDefs as Record<string, Record<string, any>>
    )) {
      const {
        variants: _variants,
        compoundVariants: _compoundVariants,
        defaultVariants = {},
        ...baseStyles
      } = def;

      result[key] = {
        _raw: {
          styles: flattenStyles(baseStyles, utils) as RNStyle,
          variants: flattenVariantStyles(_variants || {}, utils) as Record<
            string,
            Record<string | number, RNStyle>
          >,
          compoundVariants: flattenCompoundVariantStyles(
            _compoundVariants || [],
            utils
          ) as Array<{ css: RNStyle; [k: string]: string | number | RNStyle }>,
          defaultVariants: defaultVariants as Record<string, string | number>,
        },
        _sheets: {},
      };
    }

    return result as { [K in keyof Defs]: StyleEntry };
  }

  function resolveEntry(
    entry: StyleEntry,
    tokenValues: Record<string, string | number>,
    themeKey: string,
    activeMediaQueries: string[]
  ): object[] {
    if (!entry._sheets[themeKey]) {
      entry._sheets[themeKey] = createStyleSheet({
        tokenValues,
        styles: entry._raw.styles,
        variants: entry._raw.variants,
        compoundVariants: entry._raw.compoundVariants,
      });
    }

    const sheet = processStyleSheet(
      entry._sheets[themeKey],
      media,
      activeMediaQueries
    );

    const variantStyles = resolveVariantStylesList(
      {},
      entry._raw.variants,
      entry._raw.defaultVariants,
      media,
      sheet,
      activeMediaQueries
    );

    const compoundStyles = resolveCompoundVariantStylesList(
      {},
      entry._raw.defaultVariants,
      entry._raw.compoundVariants,
      sheet
    );

    return [sheet.base, ...variantStyles, ...compoundStyles].filter(Boolean);
  }

  function resolveAll(
    styles: StyleItem[],
    tokenValues: Record<string, string | number>,
    themeKey: string,
    activeMediaQueries: string[]
  ): { style: object[] } {
    const result: object[] = [];
    for (const item of styles) {
      if (!item) continue;
      result.push(
        ...resolveEntry(item, tokenValues, themeKey, activeMediaQueries)
      );
    }
    return { style: result };
  }

  function props(...styles: StyleItem[]): { style: object[] } {
    const { width } = Dimensions.get('window');
    const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const activeMediaQueries = resolveMediaRangeQueries(media, correctedWidth);
    return resolveAll(
      styles,
      EMPTY_TOKEN_VALUES,
      'default',
      activeMediaQueries
    );
  }

  function useStylex() {
    const override = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    const activeMediaQueries = useMemo(
      () => {
        const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
        return resolveMediaRangeQueries(media, correctedWidth);
      },
      [width] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const themeKey = override ? override.__themeId : 'default';
    const tokenValues = override ? override.__tokenValues : EMPTY_TOKEN_VALUES;

    return useMemo(
      () => ({
        props: (...styles: StyleItem[]) =>
          resolveAll(styles, tokenValues, themeKey, activeMediaQueries),
      }),
      [themeKey, activeMediaQueries] // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  return {
    create,
    props,
    useStylex,
    defineVars,
    defineConsts,
    createTheme,
    ThemeProvider,
    media: config.media,
    utils: config.utils,
  };
}

export default createStylex;

export const { create, props, useStylex } = createStylex();
