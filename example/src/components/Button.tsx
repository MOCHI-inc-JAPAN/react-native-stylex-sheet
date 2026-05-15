import { TouchableOpacity } from 'react-native';
import { create, useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';
import type { StyleEntry } from '../styles';
import { vars } from '../styles';
import { Text } from './Text';

const buttonStyles = create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    minWidth: 100,
    backgroundColor: vars.primary,
    elevation: 5,
  },
  variantPrimary: { backgroundColor: vars.primary },
  variantSecondary: { backgroundColor: vars.secondary },
  sizeSm: { height: 32, paddingHorizontal: vars.space2 },
  sizeLg: { height: 44, paddingHorizontal: vars.space3 },
  outlined: { borderWidth: 1, elevation: 0 },
  outlinedPrimary: { borderColor: vars.primary, backgroundColor: 'transparent' },
  outlinedSecondary: {
    borderColor: vars.secondary,
    backgroundColor: 'transparent',
  },
});

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'large';

const VARIANT_STYLES: Record<ButtonVariant, StyleEntry> = {
  primary: buttonStyles.variantPrimary,
  secondary: buttonStyles.variantSecondary,
};

const OUTLINED_VARIANT_STYLES: Record<ButtonVariant, StyleEntry> = {
  primary: buttonStyles.outlinedPrimary,
  secondary: buttonStyles.outlinedSecondary,
};

type Props = {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  outlined?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'large',
  outlined = false,
}: Props) {
  const sx = useStylex();
  return (
    <TouchableOpacity
      {...sx.props(
        buttonStyles.base,
        VARIANT_STYLES[variant],
        size === 'small' && buttonStyles.sizeSm,
        size === 'large' && buttonStyles.sizeLg,
        outlined && buttonStyles.outlined,
        outlined && OUTLINED_VARIANT_STYLES[variant]
      )}
    >
      <Text variant="body">{children}</Text>
    </TouchableOpacity>
  );
}
