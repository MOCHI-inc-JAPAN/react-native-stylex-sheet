import { RNStyle, VariantStyleSheet } from './types';
export type Media = Record<string, string | boolean>;

export const media = <T extends VariantStyleSheet<string, RNStyle>>(
  target: T,
  windowWidth: number
): T[keyof T][] => {
  const exStyle = matchMedia(target, windowWidth);
  if (exStyle) {
    return [target.default, target[exStyle]] as T[keyof T][];
  }
  return [target.default] as T[keyof T][];
};

export function matchMedia<T extends VariantStyleSheet<string, RNStyle>>(
  style: T,
  windowWidth: number
): string | void {
  for (const key of Object.keys(style)) {
    if (matchMediaRangeQuery(key, windowWidth)) {
      return key;
    }
  }
}

const VALID_SIGNS = ['<=', '<', '>=', '>'];

function matchMediaRangeQuery(query: string, windowWidth: number): boolean {
  const singleRangeRegex = /^\(width\s+([><=]+)\s+([0-9]+)px\)$/;
  const multiRangeRegex = /^\(([0-9]+)px\s([><=]+)\swidth\s+([><=]+)\s+([0-9]+)px\)$/; // prettier-ignore
  const singleRangeMatches = query.match(singleRangeRegex);
  const multiRangeMatches = query.match(multiRangeRegex);

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
