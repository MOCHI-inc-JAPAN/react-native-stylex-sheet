import { View } from 'react-native';
import type { StyleEntry } from '../styles';
import { create, useStylex, vars } from '../styles';
import type { SpaceKey } from '../styles';

const spacerStyles = create({
  base: { flexShrink: 0 },
  sizeNone: { width: vars.spaceNone, height: vars.spaceNone },
  size1: { width: vars.space1, height: vars.space1 },
  size2: { width: vars.space2, height: vars.space2 },
  size3: { width: vars.space3, height: vars.space3 },
  size4: { width: vars.space4, height: vars.space4 },
  size5: { width: vars.space5, height: vars.space5 },
  size6: { width: vars.space6, height: vars.space6 },
  size7: { width: vars.space7, height: vars.space7 },
  size8: { width: vars.space8, height: vars.space8 },
  size9: { width: vars.space9, height: vars.space9 },
  axisX: { height: 'auto' as any },
  axisY: { width: 'auto' as any },
  debug: { backgroundColor: 'red' },
});

const SIZE_STYLES: Record<SpaceKey, StyleEntry> = {
  none: spacerStyles.sizeNone,
  '1': spacerStyles.size1,
  '2': spacerStyles.size2,
  '3': spacerStyles.size3,
  '4': spacerStyles.size4,
  '5': spacerStyles.size5,
  '6': spacerStyles.size6,
  '7': spacerStyles.size7,
  '8': spacerStyles.size8,
  '9': spacerStyles.size9,
  max: spacerStyles.size9,
};

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
        SIZE_STYLES[size],
        axis === 'x' && spacerStyles.axisX,
        axis === 'y' && spacerStyles.axisY,
        debug && spacerStyles.debug
      )}
    />
  );
}

(Spacer as any).__SPACER__ = true;
