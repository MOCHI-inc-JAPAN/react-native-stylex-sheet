import { StyleSheet } from 'react-native';
import { isThemeToken } from './tokens';

/**
 * スタイルオブジェクトを再帰的に走査し、ThemeToken を解決済みの値に置き換える。
 * ネストされたオブジェクト（メディアクエリのネストなど）にも再帰的に適用される。
 * tokenValues に該当する varId がない場合はトークンのデフォルト値を使う。
 */
export function resolveTokensDeep(
  styles: Record<string, any>,
  tokenValues: Record<string, string | number>
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(styles)) {
    if (isThemeToken(v)) {
      // ThemeToken → activeなテーマの値、なければデフォルト値
      out[k] = tokenValues[v.__varId] ?? v.__default;
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      // ネストされたオブジェクト（メディアクエリのネストなど）は再帰処理
      out[k] = resolveTokensDeep(v as Record<string, any>, tokenValues);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function createStyleSheet({
  tokenValues,
  styles,
}: {
  tokenValues: Record<string, string | number>;
  styles: Record<string, any>;
}): Record<string, any> {
  return StyleSheet.create({
    base: styles ? resolveTokensDeep(styles, tokenValues) : {},
  });
}

export function processStyleSheet(
  styleSheet: Record<string, any>,
  media: Record<string, any>,
): Record<string, any> {
  const processedStyleSheet: Record<string, any> = {};

  Object.entries(styleSheet).forEach(([sKey, sVal]) => {
    processedStyleSheet[sKey] = {};

    Object.entries(sVal).forEach(([vKey, vValue]) => {
      if (!(vKey in media)) {
        processedStyleSheet[sKey][vKey] = vValue;
      }
    });
  });

  return processedStyleSheet;
}
