import React, { Fragment } from 'react';
import { View, ViewStyle } from 'react-native';
import {
  create,
  useStylex,
  createVariants,
  type Variants,
} from '@mochi-inc-japan/react-native-stylex-sheet';
import { Spacer } from './Spacer';
import type { SpaceKey } from '../styles';
import { flattenChildren } from './utils';

const variants = createVariants({
  align: {
    alignItems: {
      center: 'center',
      start: 'flex-start',
      end: 'flex-end',
      stretch: 'stretch',
    },
  },
  axis: {
    flexDirection: {
      x: 'row',
      y: 'column',
    },
  },
  justify: {
    justifyContent: {
      center: 'center',
      start: 'flex-start',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
    },
  },
});

const stackStyles = create({
  base: {
    ...variants.align,
    ...variants.axis,
    ...variants.justify,
  },
});

type Axis = 'x' | 'y';
type Align = 'center' | 'start' | 'end' | 'stretch';
type Justify = 'center' | 'start' | 'end' | 'between' | 'around';

type Props = {
  space: SpaceKey;
  axis?: Axis;
  align?: Align;
  justify?: Justify;
  style?: ViewStyle;
  debug?: boolean;
  children: React.ReactNode;
};

export function Stack({
  children,
  axis,
  space,
  align,
  justify,
  debug,
  style,
}: Props) {
  const sx = useStylex();
  const elements = flattenChildren(children).filter((e) =>
    React.isValidElement(e)
  );
  const lastIndex = React.Children.count(elements) - 1;


  return (
    <View
      {...sx.props(
        sx.mix<Variants<typeof variants>>(
          stackStyles.base,
          {
            align,
            axis,
            justify,
          }
        ),
        style
      )}
    >
      {elements.map((child, index) => {
        if (!React.isValidElement(child)) return null;

        const isSpacer = (child as any).type['__SPACER__'];
        if (isSpacer) return React.cloneElement(child);

        const isLast = index === lastIndex;
        const nextElement = isLast ? null : (elements[index + 1] as any);
        const isNextSpacer = nextElement && nextElement.type['__SPACER__'];
        const shouldAddSpacing = !isLast && !isNextSpacer;

        return (
          <Fragment key={index}>
            {React.cloneElement(child)}
            {shouldAddSpacing && (
              <Spacer axis={axis} size={space} debug={debug} />
            )}
          </Fragment>
        );
      })}
    </View>
  );
}
