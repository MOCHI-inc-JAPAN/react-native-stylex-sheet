import { Text as RNText, TextProps } from 'react-native';
import {
  createVariants,
  create,
  useStylex,
} from '@mochi-inc-japan/react-native-stylex-sheet';
import type { StyleEntry, Variants } from '../styles';
import { vars, themes, media } from '../styles';

const variants = createVariants({
  color: {
    color: {
      primary: 'red',
      secondary: 'blue',
      third: 'purple',
      forth: 'green',
      fifth: 'black',
    },
  },
});

const mediaStyles = create({
  base: {
    color: {
      default: vars.text,
      [themes.dark]: 'red',
    },
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
  color: variants.color,
});

export type MediaColor = 'primary' | 'secondary' | 'third' | 'forth' | 'fifth';

type Props = TextProps & {
  color?: MediaColor;
};

export function Media({ color, children, ...rest }: Props) {
  const sx = useStylex();
  return (
    <RNText
      {...sx.props(
        sx.mix<Variants<typeof variants>>(mediaStyles.base, { color }),
      )}
      {...rest}
    >
      {children}
    </RNText>
  );
}
