import React from 'react';
import { View, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import * as stylex from '../';
import { Variants } from '../utils/types';

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

describe('Basic', () => {
  it('create() + props() returns base styles', () => {
    const styles = stylex.create({
      view: {
        backgroundColor: 'red',
        height: 100,
        width: 100,
      },
    });

    const { style } = stylex.props(styles.view);
    expect(style[0]).toMatchObject({
      backgroundColor: 'red',
      height: 100,
      width: 100,
    });
  });

  it('stylex.props() renders base styles', () => {
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: 100 },
      view2: { height: 200, width: 200 },
    });

    function Comp() {
      return <View {...stylex.props(styles.view, styles.view2)} />;
    }
    const { toJSON } = render(<Comp />);
    expect(toJSON()?.props.style[1]).toMatchObject({
      height: 200,
      width: 200,
    });
  });

  it('stylex.props() has backward compatibility on StyleSheet', () => {
    const sameArgs = {
      view: { backgroundColor: 'red', height: 100, width: 100 },
      view2: { height: 200, width: 200 },
    };
    const styles = stylex.create(sameArgs);

    const orgStyles = StyleSheet.create(sameArgs);

    expect(stylex.props(styles.view, styles.view2).style).toMatchObject([
      orgStyles.view,
      orgStyles.view2,
    ]);
  });
});

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

describe('Variants', () => {
  it('variants are applied correctly', () => {
    const vars = stylex.defineVars({
      colors: {
        default: 'white',
        primary: 'red',
        secondary: 'blue',
      },
      sizes: {
        default: 10,
        small: 5,
        medium: 15,
      },
    });

    const variants = stylex.createVariants({
      color: vars.colors,
      size: vars.sizes,
    });

    const styles = stylex.create({
      view: {
        backgroundColor: variants.color,
        width: variants.size,
      },
    });

    expect(stylex.props(styles.view).style[0]).toMatchObject({
      backgroundColor: 'white',
      width: 10,
    });

    expect(stylex.props(styles.view).style.length).toBe(1);

    expect(
      stylex.props(
        stylex.variants<Variants<typeof variants>>(styles.view, {
          color: 'primary',
          size: 'medium',
        })
      ).style
    ).toMatchObject([
      {
        backgroundColor: 'white',
        width: 10,
      },
      {
        backgroundColor: 'red',
      },
      {
        width: 15,
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// Media queries
// ---------------------------------------------------------------------------

describe('Media', () => {
  it('single media queries', () => {
    const media = stylex.defineVars({
      md: '(width >= 750px)',
      lg: '(width >= 1080px)',
    });

    const styles = stylex.create({
      view: {
        backgroundColor: {
          default: 'yellow',
          [media.md]: 'blue',
          [media.lg]: 'green',
        },
      },
    });

    function Comp() {
      const sx = stylex.useMedia();
      return <View {...sx.props(styles.view)} />;
    }

    mockDimensions({ width: 640 });
    expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
      backgroundColor: 'yellow',
      color: 'red',
      width: 100,
      height: 100,
      fontSize: 20,
    });

    mockDimensions({ width: 750 });
    expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
      backgroundColor: 'yellow',
      color: 'blue',
      fontSize: 10,
      width: 50,
      height: 50,
    });

    mockDimensions({ width: 1080 });
    expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
      backgroundColor: 'yellow',
      color: 'blue',
      fontSize: 40,
      width: 200,
      height: 200,
    });
  });

  it('Conditional styles simulate responsive variants', () => {
    mockDimensions({ width: 1080 });

    const stylex = createStylex({
      media: { md: '(width >= 750px)', lg: '(width >= 1080px)' },
    });

    const styles = stylex.create({
      primary: { color: 'red' },
      secondary: { color: 'blue' },
    });

    function Comp({ useLg }: { useLg: boolean }) {
      const sx = stylex.useStylex();
      return (
        <View
          {...sx.props(!useLg && styles.primary, useLg && styles.secondary)}
        />
      );
    }

    const { toJSON } = render(<Comp useLg={true} />);
    expect(reduceStyles(toJSON()?.props.style)).toMatchObject({
      color: 'blue',
    });

    const { toJSON: toJSON2 } = render(<Comp useLg={false} />);
    expect(reduceStyles(toJSON2()?.props.style)).toMatchObject({
      color: 'red',
    });
  });
});
