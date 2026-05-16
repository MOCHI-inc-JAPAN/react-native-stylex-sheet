import { TouchableOpacity } from 'react-native';
import { create, useStylex, createVariants, type Variants } from '@mochi-inc-japan/react-native-stylex-sheet';
import { vars } from '../styles';
import { Text } from './Text';

const buttonVariants = createVariants({
  variant: {
    backgroundColor: {
      primary: vars.primary,
      secondary: vars.secondary,
    },
  },
  outlinedColor: {
    borderColor: {
      primary: vars.primary,
      secondary: vars.secondary,
    },
    backgroundColor: {
      primary: 'transparent',
      secondary: 'transparent',
    },
  },
  size: {
    height: { sm: 32, lg: 44 },
    paddingHorizontal: { sm: vars.space2, lg: vars.space3 },
  },
});

const buttonStyles = create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    minWidth: 100,
    elevation: 5,
  },
  button: {
    ...buttonVariants.variant,
    ...buttonVariants.outlinedColor,
    ...buttonVariants.size,
  },
  outlined: { borderWidth: 1, elevation: 0 },
});

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'small' | 'large';

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
        sx.mix<Variants<typeof buttonVariants>>(buttonStyles.button, {
          variant,
          size: size === 'small' ? 'sm' : 'lg',
          outlinedColor: outlined ? variant : undefined,
        }),
        outlined && buttonStyles.outlined
      )}
    >
      <Text variant="body">{children}</Text>
    </TouchableOpacity>
  );
}
