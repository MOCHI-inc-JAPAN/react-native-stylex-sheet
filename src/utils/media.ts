import { RNStyle, VariantStyleSheet } from './types';
export type Media = Record<string, string | boolean>;

export const media = <T extends VariantStyleSheet<string, RNStyle>>(
  target: T,
  mediaParam: number | string
): T[keyof T][] => {
  const result: T[keyof T][] = [];
  if (typeof mediaParam === 'string') {
    target[mediaParam] && result.push(target[mediaParam] as T[keyof T]);
  } else if (typeof mediaParam === 'number') {
    const keys = Object.keys(target);
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      // NOTE: Assuming only one media query will match, we can break after the first match.
      // Because later media query will be more specific and override the previous one.
      if (matchMediaRangeQuery(key, mediaParam)) {
        result.push(target[key] as T[keyof T]);
        break;
      }
    }
  }
  return result;
};

// NOTE: input mediaKeys
// - ['(750px <= width < 1080px)', '(width > 750px)']
export const detectMedia = (
  mediaKeys: string[] | Record<string, string>,
  width: number
): string | undefined => {
  const targets = Array.isArray(mediaKeys)
    ? mediaKeys
    : Object.values(mediaKeys);
  for (const val of targets) {
    if (matchMediaRangeQuery(val, width)) {
      return val;
    }
  }
  return;
};

const VALID_SIGNS = ['<=', '<', '>=', '>'];

export function matchMediaRangeQuery(
  query: string,
  windowWidth: number
): boolean {
  const singleRangeRegex = /^\(width\s+([><=]+)\s+([0-9]+)px\)$/;
  const multiRangeRegex = /^\(([0-9]+)px\s([><=]+)\swidth\s+([><=]+)\s+([0-9]+)px\)$/; // prettier-ignore
  const singleRangeMatches = query.match(singleRangeRegex);
  const multiRangeMatches = query.match(multiRangeRegex);

  if (!singleRangeMatches && !multiRangeMatches) return false;

  let result;

  if (multiRangeMatches && multiRangeMatches.length === 5) {
    const [, _width1, sign1, sign2, _width2] = multiRangeMatches;
    const width1 = parseInt(_width1, 10);
    const width2 = parseInt(_width2, 10);

    if (VALID_SIGNS.includes(sign1) && VALID_SIGNS.includes(sign2)) {
      result = eval(
        `${width1} ${sign1} ${windowWidth} && ${windowWidth} ${sign2} ${width2}`
      );
    }
  } else if (singleRangeMatches && singleRangeMatches.length === 3) {
    const [, sign, _width] = singleRangeMatches;
    const width = parseInt(_width, 10);

    if (VALID_SIGNS.includes(sign)) {
      result = eval(`${windowWidth} ${sign} ${width}`);
    }
  }

  if (result === undefined) return false;

  if (typeof result !== 'boolean') {
    console.warn(
      `Unexpected media query result. Expected a boolean but got ${result}. Please make sure your media query syntax is correct.`
    );
  }

  return result;
}
