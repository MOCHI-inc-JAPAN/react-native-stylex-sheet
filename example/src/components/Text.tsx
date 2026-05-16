import { create, useStylex, createVariants, type Variants } from '@mochi-inc-japan/react-native-stylex-sheet';
import { Text as RNText, TextProps } from 'react-native';
import { themes, vars } from '../styles';

const textVariants = createVariants({
  variant: {
    fontSize: {
      body: 18,
      bodySmall: 16,
      bodyExtraSmall: 14,
      title1: 32,
      title2: 24,
      title3: 20,
    },
    fontWeight: {
      body: '400',
      bodySmall: '400',
      bodyExtraSmall: '500',
      title1: '700',
      title2: '700',
      title3: '700',
    },
  },
  color: {
    color: {
      primary: vars.primary,
      primaryText: vars.primaryText,
      primaryMuted: vars.primaryMuted,
      secondary: vars.secondary,
      secondaryText: vars.secondaryText,
      text: vars.text,
      textInverted: vars.textInverted,
      error: vars.error,
      success: vars.success,
      warn: vars.warn,
    },
  },
  align: {
    textAlign: {
      left: 'left',
      right: 'right',
      center: 'center',
    },
  },
});

const textStyles = create({
  base: {
    color: { default: vars.text, [themes.dark]: vars.textInverted },
    fontSize: 16,
  },
  variants: {
    ...textVariants.variant,
    ...textVariants.color,
    ...textVariants.align,
  },
});

export type TextVariant =
  | 'body'
  | 'bodySmall'
  | 'bodyExtraSmall'
  | 'title1'
  | 'title2'
  | 'title3';

export type TextColor =
  | 'primary'
  | 'primaryText'
  | 'primaryMuted'
  | 'secondary'
  | 'secondaryText'
  | 'text'
  | 'textInverted'
  | 'error'
  | 'success'
  | 'warn';

export type TextAlign = 'left' | 'right' | 'center';

type Props = TextProps & {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
};

export function Text({ variant = 'body', color, align, ...rest }: Props) {
  const sx = useStylex();
  return (
    <RNText
      {...sx.props(
        textStyles.base,
        sx.mix<Variants<typeof textVariants>>(textStyles.variants, { variant, color, align })
      )}
      {...rest}
    />
  );
}
