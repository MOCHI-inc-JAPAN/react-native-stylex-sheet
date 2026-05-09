import React, { Fragment } from 'react';
import { View, ViewStyle } from 'react-native';
import type { StyleEntry } from '../styles';
import { Spacer } from './Spacer';
import { create, useStylex } from '../styles';
import type { SpaceKey } from '../styles';
import { flattenChildren } from './utils';

const stackStyles = create({
  base: {},
  axisX: { flexDirection: 'row' },
  axisY: { flexDirection: 'column' },
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignStretch: { alignItems: 'stretch' },
  justifyCenter: { justifyContent: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
});

type Axis = 'x' | 'y';
type Align = 'center' | 'start' | 'end' | 'stretch';
type Justify = 'center' | 'start' | 'end' | 'between' | 'around';

const AXIS_STYLES: Record<Axis, StyleEntry> = {
  x: stackStyles.axisX,
  y: stackStyles.axisY,
};

const ALIGN_STYLES: Record<Align, StyleEntry> = {
  center: stackStyles.alignCenter,
  start: stackStyles.alignStart,
  end: stackStyles.alignEnd,
  stretch: stackStyles.alignStretch,
};

const JUSTIFY_STYLES: Record<Justify, StyleEntry> = {
  center: stackStyles.justifyCenter,
  start: stackStyles.justifyStart,
  end: stackStyles.justifyEnd,
  between: stackStyles.justifyBetween,
  around: stackStyles.justifyAround,
};

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

  const { style: computedStyle } = sx.props(
    stackStyles.base,
    axis && AXIS_STYLES[axis],
    align && ALIGN_STYLES[align],
    justify && JUSTIFY_STYLES[justify]
  );

  return (
    <View style={style ? [...computedStyle, style] : computedStyle}>
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
