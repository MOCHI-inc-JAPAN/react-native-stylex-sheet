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
