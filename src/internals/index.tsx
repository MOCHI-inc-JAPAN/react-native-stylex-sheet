import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

import {
  flattenCompoundVariantStyles,
  flattenStyles,
  flattenVariantStyles,
  getCompoundKey,
} from './utils';

import {
  DEFAULT_THEME_MAP,
  EMPTY_THEME,
  THEME_PROVIDER_MISSING_MESSAGE,
} from './constants';

import { createStyleSheet, processStyleSheet } from './styles';
import { processTheme } from './theme';
import { resolveMediaRangeQueries } from './media';
import type { ConfigType, DefaultThemeMap } from '../types/config';

type StoredTheme = {
  definition: Record<string, any>;
  values: Record<string, Record<string, any> | null>;
};

export type StyleEntry = {
  _raw: {
    styles: Record<string, any>;
    variants: Record<string, Record<string, Record<string, any>>>;
    compoundVariants: any[];
    defaultVariants: Record<string, string>;
  };
  _sheets: Record<string, Record<string, any>>;
};

export type VariantSpec = {
  _isVariantSpec: true;
  _entry: StyleEntry;
  _variantProps: Record<string, any>;
};

export type StyleInput = StyleEntry | VariantSpec;

function isVariantSpec(input: StyleInput): input is VariantSpec {
  return (
    '_isVariantSpec' in input && (input as VariantSpec)._isVariantSpec === true
  );
}

function resolveVariantStylesList(
  variantProps: Record<string, any>,
  variants: Record<string, Record<string, any>>,
  defaultVariants: Record<string, string>,
  media: Record<string, any>,
  styleSheet: Record<string, any>,
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
        if (initial !== undefined && styleSheet[`${prop}_${initial}`]) {
          combined = { ...combined, ...styleSheet[`${prop}_${initial}`] };
        }
        activeMediaQueries.forEach((mediaKey) => {
          const value = propValue[`@${mediaKey}`];
          if (value !== undefined && styleSheet[`${prop}_${value}`]) {
            combined = { ...combined, ...styleSheet[`${prop}_${value}`] };
          }
        });
        return Object.keys(combined).length > 0 ? combined : undefined;
      }

      return styleSheet[`${prop}_${propValue}`];
    })
    .filter(Boolean) as object[];
}

function resolveCompoundVariantStylesList(
  variantProps: Record<string, any>,
  defaultVariants: Record<string, string>,
  compoundVariants: any[],
  styleSheet: Record<string, any>
): object[] {
  if (!compoundVariants || compoundVariants.length === 0) return [];

  return compoundVariants
    .map(({ css: _css, ...compounds }) => {
      const compoundEntries = Object.entries(compounds) as [string, any][];
      const allMatch = compoundEntries.every(([prop, value]) => {
        return (variantProps[prop] ?? defaultVariants[prop]) === value;
      });
      if (allMatch) return styleSheet[getCompoundKey(compoundEntries)];
    })
    .filter(Boolean) as object[];
}

export function createStylex<
  Media extends {} = {},
  Theme extends {} = {},
  ThemeMap extends {} = DefaultThemeMap,
  Utils extends {} = {}
>(
  config: {
    media?: ConfigType.Media<Media>;
    theme?: ConfigType.Theme<Theme>;
    themeMap?: ConfigType.ThemeMap<ThemeMap>;
    utils?: ConfigType.Utils<Utils>;
  } = {}
) {
  const themes: StoredTheme[] = [];
  const media = (config.media || {}) as Record<string, string | boolean>;
  const utils = (config.utils || {}) as Record<string, (v: any) => any>;

  if (config.theme) {
    const processedTheme = processTheme(config.theme);
    processedTheme.definition.__ID__ = 'theme-1';
    themes.push(processedTheme);
  } else {
    themes.push(EMPTY_THEME);
  }

  const defaultThemeDefinition = themes[0].definition;
  const ThemeContext = createContext(defaultThemeDefinition);

  function createTheme(theme: any) {
    const newTheme = processTheme(
      Object.entries((config.theme as Record<string, any>) || {}).reduce(
        (acc, [key, val]) => {
          acc[key] = { ...(val as any), ...(theme[key] || {}) };
          return acc;
        },
        {} as Record<string, any>
      )
    );
    newTheme.definition.__ID__ = `theme-${themes.length + 1}`;
    themes.push(newTheme);
    return newTheme.definition;
  }

  function ThemeProvider({
    theme = defaultThemeDefinition,
    children,
  }: {
    theme?: any;
    children: React.ReactNode;
  }) {
    return React.createElement(
      ThemeContext.Provider,
      { value: theme },
      children
    );
  }

  function useThemeInternal(): StoredTheme {
    const themeDefinition = useContext(ThemeContext);
    if (!themeDefinition) throw new Error(THEME_PROVIDER_MISSING_MESSAGE);
    const found = themes.find(
      (t) => t.definition.__ID__ === themeDefinition.__ID__
    );
    if (!found) throw new Error(THEME_PROVIDER_MISSING_MESSAGE);
    return found;
  }

  function useTheme() {
    const themeDefinition = useContext(ThemeContext);
    if (!themeDefinition) throw new Error(THEME_PROVIDER_MISSING_MESSAGE);
    return themes.find((t) => t.definition.__ID__ === themeDefinition.__ID__)
      ?.values;
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

  function variants(
    entry: StyleEntry,
    variantProps: Record<string, any>
  ): VariantSpec {
    return {
      _isVariantSpec: true,
      _entry: entry,
      _variantProps: variantProps,
    };
  }

  function resolveProps(
    input: StyleInput,
    theme: StoredTheme,
    activeMediaQueries: string[]
  ): { style: any } {
    const entry = isVariantSpec(input) ? input._entry : input;
    const variantProps = isVariantSpec(input) ? input._variantProps : {};
    const themeId = theme.definition.__ID__;

    if (!entry._sheets[themeId]) {
      entry._sheets[themeId] = createStyleSheet({
        styles: entry._raw.styles,
        variants: entry._raw.variants,
        compoundVariants: entry._raw.compoundVariants,
        theme: (theme.values as Record<string, object>) || {},
        themeMap: config.themeMap,
      });
    }

    const sheet = processStyleSheet(
      entry._sheets[themeId],
      media,
      activeMediaQueries
    );

    const variantStylesList = resolveVariantStylesList(
      variantProps,
      entry._raw.variants,
      entry._raw.defaultVariants,
      media,
      sheet,
      activeMediaQueries
    );
    const compoundStylesList = resolveCompoundVariantStylesList(
      variantProps,
      entry._raw.defaultVariants,
      entry._raw.compoundVariants,
      sheet
    );

    const styles = [
      sheet.base,
      ...variantStylesList,
      ...compoundStylesList,
    ].filter(Boolean);

    return { style: styles };
  }

  // Static props — uses default theme, reads dimensions synchronously (non-reactive)
  function props(input: StyleInput): { style: any } {
    const { width } = Dimensions.get('window');
    const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const activeMediaQueries = resolveMediaRangeQueries(media, correctedWidth);
    return resolveProps(input, themes[0], activeMediaQueries);
  }

  // Hook returning theme-reactive and media-reactive {props, variants}
  function useStylex() {
    const theme = useThemeInternal();
    const { width } = useWindowDimensions();

    const activeMediaQueries = useMemo(
      () => {
        const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
        return resolveMediaRangeQueries(media, correctedWidth);
      },
      [width] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return useMemo(
      () => ({
        props: (input: StyleInput) =>
          resolveProps(input, theme, activeMediaQueries),
        variants,
      }),
      [theme, activeMediaQueries] // eslint-disable-line react-hooks/exhaustive-deps
    );
  }

  return {
    create,
    props,
    variants,
    useStylex,
    theme: themes[0].definition,
    createTheme,
    ThemeProvider,
    useTheme,
    config,
    media: config.media,
    utils: config.utils,
  };
}

export default createStylex;

// Convenience exports from a default (no-config) instance
export const { create, props, variants, useStylex } = createStylex();

export const defaultThemeMap = DEFAULT_THEME_MAP;
