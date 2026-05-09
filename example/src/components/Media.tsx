import { Text as RNText, TextProps } from 'react-native';
import type { StyleEntry } from '../styles';
import { create, useStylex, vars } from '../styles';

const mediaStyles = create({
  base: {
    color: vars.text,
    '@xxl': { fontSize: 64 },
    '@xl': { fontSize: 48 },
    '@lg': { fontSize: 32 },
    '@md': { fontSize: 24 },
    fontSize: 16,
    marginTopRem: 1,
    marginBottomRem: 1,
  },
  colorPrimary: { color: 'red' },
  colorSecondary: { color: 'blue' },
  colorThird: { color: 'purple' },
  colorForth: { color: 'green' },
  colorFifth: { color: 'black' },
});

export type MediaColor =
  | 'primary'
  | 'secondary'
  | 'third'
  | 'forth'
  | 'fifth';

const COLOR_STYLES: Record<MediaColor, StyleEntry> = {
  primary: mediaStyles.colorPrimary,
  secondary: mediaStyles.colorSecondary,
  third: mediaStyles.colorThird,
  forth: mediaStyles.colorForth,
  fifth: mediaStyles.colorFifth,
};

type Props = TextProps & {
  color?: MediaColor;
};

export function Media({ color, children, ...rest }: Props) {
  const sx = useStylex();
  return (
    <RNText
      {...sx.props(mediaStyles.base, color && COLOR_STYLES[color])}
      {...rest}
    >
      {children}
    </RNText>
  );
}
