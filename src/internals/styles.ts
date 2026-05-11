import { StyleSheet } from 'react-native';
import { isThemeToken } from './tokens';
import { getCompoundKey } from './utils';

export function resolveTokensDeep(
  styles: Record<string, any>,
  tokenValues: Record<string, string | number>
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(styles)) {
    if (isThemeToken(v)) {
      out[k] = tokenValues[v.__varId] ?? v.__default;
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
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
  variants,
  compoundVariants,
}: {
  tokenValues: Record<string, string | number>;
  styles: Record<string, any>;
  variants: Record<string, Record<string, Record<string, any>>>;
  compoundVariants: Array<Record<string, any>>;
}): Record<string, any> {
  return StyleSheet.create({
    base: styles ? resolveTokensDeep(styles, tokenValues) : {},
    ...Object.entries(variants).reduce(
      (acc: Record<string, any>, [variantProp, variantValues]) => {
        Object.entries(variantValues).forEach(
          ([variantName, variantStyles]) => {
            acc[`${variantProp}_${variantName}`] = resolveTokensDeep(
              variantStyles,
              tokenValues
            );
          }
        );
        return acc;
      },
      {}
    ),
    ...compoundVariants.reduce(
      (acc: Record<string, any>, cv: Record<string, any>) => {
        const { css, ...compounds } = cv;
        const entries = Object.entries(compounds) as [string, any][];
        if (entries.length > 1) {
          acc[getCompoundKey(entries)] = resolveTokensDeep(
            css || {},
            tokenValues
          );
        }
        return acc;
      },
      {}
    ),
  });
}

/**
 * Process the style sheet by inlining media styles.
 *
 * For example:
 *
 * prop_value: {
 *   color: 'red',
 *   md: { color: 'blue' }
 * }
 *
 * with `md` media query being active becomes:
 *
 * prop_value: {
 *   color: 'blue'
 * }
 */
export function processStyleSheet(
  styleSheet: Record<string, any>,
  media: Record<string, any>,
  activeMediaQueries: string[]
): Record<string, any> {
  const processedStyleSheet: Record<string, any> = {};

  Object.entries(styleSheet).forEach(([sKey, sVal]) => {
    processedStyleSheet[sKey] = {};

    const mediaStyles: Record<string, any> = {};

    Object.entries(sVal).forEach(([vKey, vValue]) => {
      if (vKey in media) {
        if (activeMediaQueries.includes(vKey)) {
          mediaStyles[vKey] = vValue;
        }
      } else {
        processedStyleSheet[sKey][vKey] = vValue;
      }
    });

    activeMediaQueries.forEach((mediaKey) => {
      const style = mediaStyles[mediaKey];
      if (style) {
        processedStyleSheet[sKey] = {
          ...processedStyleSheet[sKey],
          ...style,
        };
      }
    });
  });

  return processedStyleSheet;
}
