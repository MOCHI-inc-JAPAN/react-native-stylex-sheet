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
      [media.lg]: 30,
      [media.xl]: 36,
      [media.xxl]: 40,
    },
    marginTop: {
      [media.md]: 4,
      [media.lg]: 8,
      [media.xl]: 16,
      [media.xxl]: 24,
    },
    marginBottom: {
      [media.md]: 4,
      [media.lg]: 8,
      [media.xl]: 16,
      [media.xxl]: 24,
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
