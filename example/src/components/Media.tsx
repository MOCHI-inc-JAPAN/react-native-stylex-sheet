import { Text as RNText, TextProps } from 'react-native';
import type { StyleEntry } from '../styles';
import { create, useStylex, vars, themes, media } from '../styles';

const mediaStyles = create({
  base: {
    color: { default: vars.text, [themes.dark]: vars.textInverted },
    fontSize: {
      default: 16,
      [media.md]: 24,
      [media.lg]: 32,
      [media.xl]: 48,
      [media.xxl]: 64,
    },
    marginTop: {
      [media.md]: 18,
      [media.lg]: 20,
      [media.xl]: 24,
      [media.xxl]: 32,
    },
    marginBottom: {
      [media.md]: 18,
      [media.lg]: 20,
      [media.xl]: 24,
      [media.xxl]: 32,
    },
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
