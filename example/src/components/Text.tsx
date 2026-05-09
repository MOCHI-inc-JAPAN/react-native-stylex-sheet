import { Text as RNText, TextProps } from 'react-native';
import type { StyleEntry } from '../styles';
import { create, useStylex, vars } from '../styles';

const textStyles = create({
  base: { color: vars.text, fontSize: 16 },
  // color variants
  colorPrimary: { color: vars.primary },
  colorPrimaryText: { color: vars.primaryText },
  colorPrimaryMuted: { color: vars.primaryMuted },
  colorSecondary: { color: vars.secondary },
  colorSecondaryText: { color: vars.secondaryText },
  colorText: { color: vars.text },
  colorTextInverted: { color: vars.textInverted },
  colorError: { color: vars.error },
  colorSuccess: { color: vars.success },
  colorWarn: { color: vars.warn },
  // variant styles
  variantBody: { typography: '$body' },
  variantBodySmall: { typography: '$bodySmall' },
  variantBodyExtraSmall: { typography: '$bodyExtraSmall' },
  variantTitle1: { typography: '$title1' },
  variantTitle2: { typography: '$title2' },
  variantTitle3: { typography: '$title3' },
  // align styles
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
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

const VARIANT_STYLES: Record<TextVariant, StyleEntry> = {
  body: textStyles.variantBody,
  bodySmall: textStyles.variantBodySmall,
  bodyExtraSmall: textStyles.variantBodyExtraSmall,
  title1: textStyles.variantTitle1,
  title2: textStyles.variantTitle2,
  title3: textStyles.variantTitle3,
};

const COLOR_STYLES: Record<TextColor, StyleEntry> = {
  primary: textStyles.colorPrimary,
  primaryText: textStyles.colorPrimaryText,
  primaryMuted: textStyles.colorPrimaryMuted,
  secondary: textStyles.colorSecondary,
  secondaryText: textStyles.colorSecondaryText,
  text: textStyles.colorText,
  textInverted: textStyles.colorTextInverted,
  error: textStyles.colorError,
  success: textStyles.colorSuccess,
  warn: textStyles.colorWarn,
};

const ALIGN_STYLES: Record<TextAlign, StyleEntry> = {
  left: textStyles.alignLeft,
  right: textStyles.alignRight,
  center: textStyles.alignCenter,
};

type Props = TextProps & {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
};

export function Text({
  variant = 'body',
  color,
  align,
  ...rest
}: Props) {
  const sx = useStylex();
  return (
    <RNText
      {...sx.props(
        textStyles.base,
        VARIANT_STYLES[variant],
        color && COLOR_STYLES[color],
        align && ALIGN_STYLES[align]
      )}
      {...rest}
    />
  );
}
