import React, { createContext, useContext, useMemo } from 'react';
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

import { flattenStyles } from './utils';

import { ThemeOverride, createTheme, defineConsts, defineVars } from './tokens';

import { resolveMediaRangeQueries } from './media';
import type {
  MediaConfig,
  RNStyle,
  StyleEntryDef,
  UtilsConfig,
} from './style-types';
import { createStyleSheet, processStyleSheet } from './styles';

export type { ThemeOverride, ThemeToken, VarsGroup } from './tokens';
export { createTheme, defineConsts, defineVars };

export type StyleEntry = {
  _raw: {
    styles: RNStyle;
  };
  _sheets: Record<string, Record<string, RNStyle>>;
};

export type StyleItem = StyleEntry | null | false | undefined;

const EMPTY_TOKEN_VALUES: Record<string, string | number> = {};

// media は createStylex インスタンスごとに異なるため引数で受け取る
function resolveEntry(
  entry: StyleEntry,
  tokenValues: Record<string, string | number>,
  themeKey: string,
  media: Record<string, any>
): object[] {
  if (!entry._sheets[themeKey]) {
    entry._sheets[themeKey] = createStyleSheet({
      tokenValues,
      styles: entry._raw.styles,
    });
  }

  const sheet = processStyleSheet(
    entry._sheets[themeKey],
    media,
  );

  return [sheet.base].filter(Boolean);
}

function resolveAll(
  styles: StyleItem[],
  tokenValues: Record<string, string | number>,
  themeKey: string,
  media: Record<string, any>
): { style: object[] } {
  const result: object[] = [];
  for (const item of styles) {
    if (!item) continue;
    result.push(
      ...resolveEntry(item, tokenValues, themeKey, media)
    );
  }
  return { style: result };
}

// ThemeContext はモジュールレベルで共有（複数インスタンスは同一コンテキストを使用）
const ThemeContext = createContext<ThemeOverride | null>(null);

export function ThemeProvider({
  theme = null,
  children,
}: {
  theme?: ThemeOverride | null;
  children: React.ReactNode;
}) {
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}

// useStylex は media クロージャを持つためインスタンス内に定義する
export function useStylex() {
  const override = useContext(ThemeContext);
  const themeKey = override ? override.__themeId : 'default';
  const tokenValues = override ? override.__tokenValues : EMPTY_TOKEN_VALUES;

  return useMemo(
    () => ({
      props: (...styles: StyleItem[]) =>
        resolveAll(styles, tokenValues, themeKey,  media),
    }),
    [themeKey] // eslint-disable-line react-hooks/exhaustive-deps
  );
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

  function create<Defs extends Record<string, StyleEntryDef<Media, Utils>>>(
    styleDefs: Defs
  ): { [K in keyof Defs]: StyleEntry } {
    const result: Record<string, StyleEntry> = {};

    for (const [key, def] of Object.entries(
      styleDefs as Record<string, Record<string, any>>
    )) {
      result[key] = {
        _raw: {
          styles: flattenStyles(def, utils) as RNStyle,
        },
        _sheets: {},
      };
    }

    return result as { [K in keyof Defs]: StyleEntry };
  }

  function props(...styles: StyleItem[]): { style: object[] } {
    const { width } = Dimensions.get('window');
    const correctedWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    const activeMediaQueries = resolveMediaRangeQueries(media, correctedWidth);
    return resolveAll(
      styles,
      EMPTY_TOKEN_VALUES,
      'default',
      activeMediaQueries,
      media
    );
  }

  return {
    create,
    props,
    defineVars,
    defineConsts,
    createTheme,
    ThemeProvider,
    media: config.media,
    utils: config.utils,
  };
}

export default createStylex;

export const { create, props } = createStylex();
