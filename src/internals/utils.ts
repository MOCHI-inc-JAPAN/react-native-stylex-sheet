type StyleObject = Record<string, any>;
type UtilMap = Record<string, (v: any) => StyleObject>;

function isPlainObject(val: unknown): val is StyleObject {
  return (
    val !== null &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    Object.getPrototypeOf(val) === Object.prototype
  );
}

function merge(target: StyleObject, source: StyleObject): StyleObject {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    if (srcVal === undefined) continue;
    const tgtVal = target[key];
    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      target[key] = merge({ ...tgtVal }, srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

export function getCompoundKey(compoundEntries: [string, any][]): string {
  // Eg. `color_primary+size_small`
  return (
    compoundEntries
      // Sort compound entries alphabetically
      .sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      })
      .reduce((keyAcc, [prop, value]) => {
        return keyAcc + `${prop}_${value}+`;
      }, '')
      .slice(0, -1)
  ); // Remove last `+` character
}

/**
 * Flatten styles so that styles from utils and media queries are recursively merged.
 *
 * For example:
 *
 * Result:
 * {
 *   color: 'red',
 *   fontSize: 20,
 *   width: 100,
 *   height: 100,
 *   '@bp1': {
 *     color: 'blue',
 *     fontSize: 10,
 *   },
 *   '@bp2': {
 *     fontSize: 40,
 *     width: 300,
 *     height: 300,
 *   }
 * }
 */
export function flattenStyles(
  styles: StyleObject,
  utils: UtilMap | undefined
): StyleObject {
  let flatStyles: StyleObject = {};

  Object.entries(styles).forEach(([key, val]) => {
    if (key.startsWith('@')) {
      const k = key.replace('@', '');
      // Media queries
      if (!flatStyles[k]) {
        flatStyles[k] = {};
      }
      flatStyles[k] = merge(
        flatStyles[k],
        flattenStyles(val as StyleObject, utils)
      );
    } else if (utils && key in utils) {
      // Utils
      const util = utils[key];
      flatStyles = merge(flatStyles, flattenStyles(util(val), utils));
    } else {
      // Base styles
      flatStyles[key] = val;
    }
  });

  return flatStyles;
}

/**
 * Flatten the styles inside variant definitions so that utils and media styles are recusively merged.
 *
 * For example:
 *
 * Result:
 * variants: {
 *   v1: {
 *     x: {
 *       fontSize: 20,
 *       bp1: {
 *         fontSize: 10,
 *       },
 *       bp2: {
 *         fontSize: 40,
 *       }
 *     },
 *     y: {
 *       width: 100,
 *       height: 100,
 *       fontSize: 20,
 *       bp1: {
 *         fontSize: 10,
 *       },
 *       bp2: {
 *         fontSize: 40,
 *         width: 300,
 *         height: 300,
 *       },
 *     },
 *   },
 * }
 */
export function flattenVariantStyles(
  variants: Record<string, Record<string, StyleObject>>,
  utils: UtilMap | undefined
): Record<string, Record<string, StyleObject>> {
  const flatVariants: Record<string, Record<string, StyleObject>> = {};

  Object.entries(variants).forEach(([variantProp, variantObj]) => {
    flatVariants[variantProp] = {};
    Object.entries(variantObj).forEach(([variantName, variantStyles]) => {
      flatVariants[variantProp][variantName] = flattenStyles(
        variantStyles,
        utils
      );
    });
  });

  return flatVariants;
}

/**
 * Flatten the styles inside compound variant definitions so that utils and media styles are recusively merged.
 *
 * For example:
 *
 * compoundVariants: [{
 *   v1: 'x',
 *   v2: 'y',
 *   css: {
 *     util2: 100,
 *     '@bp1': {
 *       color: 'blue',
 *     }
 *   }
 * }]
 *
 * Result:
 * compoundVariants: [{
 *   v1: 'x',
 *   v2: 'y',
 *   css: {
 *     width: 100,
 *     height: 100,
 *     fontSize: 20,
 *     bp1: {
 *       color: 'blue',
 *       fontSize: 10,
 *     },
 *     bp2: {
 *       fontSize: 40,
 *       width: 300,
 *       height: 300,
 *     },
 *   },
 * }]
 */
export function flattenCompoundVariantStyles(
  compoundVariants: Array<Record<string, any>>,
  utils: UtilMap | undefined
): Array<Record<string, any>> {
  return compoundVariants.map((compoundVariant) => {
    return {
      ...compoundVariant,
      css: flattenStyles(compoundVariant.css, utils),
    };
  });
}
