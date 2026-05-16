import { View } from 'react-native';
import { create, useStylex, createVariants, type Variants } from '@mochi-inc-japan/react-native-stylex-sheet';
import { vars } from '../styles';
import type { SpaceKey } from '../styles';

const spacerVariants = createVariants({
  size: {
    width: {
      none: vars.spaceNone,
      '1': vars.space1,
      '2': vars.space2,
      '3': vars.space3,
      '4': vars.space4,
      '5': vars.space5,
      '6': vars.space6,
      '7': vars.space7,
      '8': vars.space8,
      '9': vars.space9,
      max: vars.space9,
    },
    height: {
      none: vars.spaceNone,
      '1': vars.space1,
      '2': vars.space2,
      '3': vars.space3,
      '4': vars.space4,
      '5': vars.space5,
      '6': vars.space6,
      '7': vars.space7,
      '8': vars.space8,
      '9': vars.space9,
      max: vars.space9,
    },
  },
  axis: {
    height: { x: 'auto' as any },
    width: { y: 'auto' as any },
  },
});

const spacerStyles = create({
  base: { flexShrink: 0 },
  spacer: {
    ...spacerVariants.size,
    ...spacerVariants.axis,
  },
  debug: { backgroundColor: 'red' },
});

type Props = {
  size: SpaceKey;
  axis?: 'x' | 'y';
  debug?: boolean;
};

export function Spacer({ size, axis, debug }: Props) {
  const sx = useStylex();
  return (
    <View
      {...sx.props(
        spacerStyles.base,
        sx.mix<Variants<typeof spacerVariants>>(spacerStyles.spacer, { size, axis }),
        debug && spacerStyles.debug
      )}
    />
  );
}

(Spacer as any).__SPACER__ = true;
