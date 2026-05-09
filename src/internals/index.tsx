import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

import {
  flattenCompoundVariantStyles,
  flattenStyles,
  flattenVariantStyles,
  getCompoundKey,
} from './utils';

import {
  ThemeOverride,
  defineVars,
  defineConsts,
  createTheme,
} from './tokens';

import { createStyleSheet, processStyleSheet } from './styles';
import { resolveMediaRangeQueries } from './media';
import type { ConfigType } from '../types/config';

export type { ThemeToken, VarsGroup, ThemeOverride } from './tokens';
export { defineVars, defineConsts, createTheme };

export type StyleEntry = {
  _raw: {
    styles: Record<string, any>;
    variants: Record<string, Record<string, Record<string, any>>>;
    compoundVariants: any[];
    defaultVariants: Record<string, string>;
  };
  _sheets: Record<string, Record<string, any>>;
};

type StyleItem = StyleEntry | null | false | undefined;

const EMPTY_TOKEN_VALUES: Record<string, string | number> = {};

function resolveVariantStylesList(
  variantProps: Record<string, any>,
  variants: Record<string, Record<string, any>>,
  defaultVariants: Record<string, string>,
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
  defaultVariants: Record<string, string>,
  compoundVariants: any[],
  sheet: Record<string, any>
): object[] {
  if (!compoundVariants || compoundVariants.length === 0) return [];

  return compoundVariants
    .map(({ css: _css, ...compounds }) => {
      const entries = Object.entries(compounds) as [string, any][];
      const allMatch = entries.every(
        ([prop, value]) => (variantProps[prop] ?? defaultVariants[prop]) === value
      );
      if (allMatch) return sheet[getCompoundKey(entries)];
    })
    .filter(Boolean) as object[];
}

export function createStylex<
  Media extends {} = {},
  Utils extends {} = {}
>(
  config: {
    media?: ConfigType.Media<Media>;
    utils?: ConfigType.Utils<Utils>;
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
    return React.createElement(ThemeContext.Provider, { value: theme }, children);
  }

  function create<T extends Record<string, Record<string, any>>>(
    styleDefs: T
  ): { [K in keyof T]: StyleEntry } {
    const result: Record<string, StyleEntry> = {};

    for (const [key, def] of Object.entries(styleDefs)) {
      const {
        variants: _variants,
        compoundVariants: _compoundVariants,
        defaultVariants = {},
        ...baseStyles
      } = def;

      result[key] = {
        _raw: {
          styles: flattenStyles(baseStyles, utils),
          variants: flattenVariantStyles(_variants || {}, utils),
          compoundVariants: flattenCompoundVariantStyles(
            _compoundVariants || [],
            utils
          ),
          defaultVariants: defaultVariants as Record<string, string>,
        },
        _sheets: {},
      };
    }

    return result as { [K in keyof T]: StyleEntry };
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
      result.push(...resolveEntry(item, tokenValues, themeKey, activeMediaQueries));
    }
    return { style: result };
  }

  function props(...styles: StyleItem[]): { style: object[] } {
    const { width } = Dimensions.get('window');
    const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const activeMediaQueries = resolveMediaRangeQueries(media, correctedWidth);
    return resolveAll(styles, EMPTY_TOKEN_VALUES, 'default', activeMediaQueries);
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
