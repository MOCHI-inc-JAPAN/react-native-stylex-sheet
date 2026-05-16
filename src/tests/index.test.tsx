import React from 'react';
import { View, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import * as stylex from '../';
import { Variants } from '../utils/types';
import { mockDimensions, reduceStyles } from './utils';

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
      var1: {
        backgroundColor: vars.colors,
      },
      var2: {
        width: vars.sizes,
      },
    });

    const styles = stylex.create({
      view: {
        backgroundColor: variants.var1.backgroundColor,
        width: variants.var2.width,
      },
    });

    expect(stylex.props(styles.view).style[0]).toMatchObject({
      backgroundColor: 'white',
      width: 10,
    });

    expect(stylex.props(styles.view).style.length).toBe(1);

    expect(
      stylex.props(
        stylex.mix<Variants<typeof variants>>(styles.view, {
          var1: 'primary',
          var2: 'medium',
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

  it('multiple style have same variant value is applied correctly', () => {
    const variants = stylex.createVariants({
      shape: {
        borderRadius: {
          default: 4,
          round: 8,
          square: 0,
          test: 1,
        },
        fontSize: {
          default: 14,
          round: 16,
          square: 18,
        },
      },
    });
    const styles = stylex.create({
      view: {
        ...variants.shape,
      },
    });

    expect(
      reduceStyles(
        stylex.props(
          stylex.mix<Variants<typeof variants>>(styles.view, {
            shape: 'round',
          })
        ).style
      )
    ).toMatchObject({ borderRadius: 8, fontSize: 16 });
    expect(
      reduceStyles(
        stylex.props(
          stylex.mix<Variants<typeof variants>>(styles.view, {
            shape: 'test',
          })
        ).style
      )
    ).toMatchObject({ borderRadius: 1, fontSize: 14 });
  });
});

// ---------------------------------------------------------------------------
// Media queries
// ---------------------------------------------------------------------------

describe('Media', () => {
  it('single media queries default', () => {
    const media = stylex.defineConsts({
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
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 640 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'yellow',
    });
  });

  it('single media queries md', () => {
    const media = stylex.defineConsts({
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
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 750 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'blue',
    });
  });

  it('single media queries lg', () => {
    const media = stylex.defineConsts({
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
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 1080 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'green',
    });
  });

  it('multi-range media query matches width inside range', () => {
    const media = stylex.defineConsts({
      md: '(750px <= width < 1080px)',
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
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 900 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'blue',
    });
  });

  it('multi-range media query does not match width outside range', () => {
    const media = stylex.defineConsts({
      md: '(750px <= width < 1080px)',
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
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 1080 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'green',
    });
  });

  it('multiple properties each with independent breakpoints', () => {
    const media = stylex.defineConsts({
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
        width: {
          default: 100,
          [media.md]: 200,
          [media.lg]: 300,
        },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    mockDimensions({ width: 750 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'blue',
      width: 200,
    });
  });

  it('multiple style entries with media queries are merged in order', () => {
    const media = stylex.defineConsts({
      md: '(width >= 750px)',
    });

    const styles = stylex.create({
      base: {
        backgroundColor: {
          default: 'yellow',
        },
        height: 100,
      },
      override: {
        backgroundColor: {
          [media.md]: 'purple',
        },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return (
        <View {...sx.props(sx.mix(styles.base), sx.mix(styles.override))} />
      );
    }

    mockDimensions({ width: 750 });
    expect(
      reduceStyles(
        render(
          <stylex.RNStyleXProvider>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      )
    ).toMatchObject({
      backgroundColor: 'purple',
      height: 100,
    });
  });
});

// ---------------------------------------------------------------------------
// Theme queries
// ---------------------------------------------------------------------------

describe('Theme', () => {
  it('theme usage', () => {
    const { themes } = stylex.createThemes(['light', 'dark']);
    const styles = stylex.create({
      view: {
        borderBlockColor: {
          default: 'black',
          [themes.light]: 'white',
          [themes.dark]: 'gray',
        },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    const outputStyle = (theme: keyof typeof themes) => {
      return reduceStyles(
        render(
          <stylex.RNStyleXProvider theme={themes[theme]}>
            <Comp />
          </stylex.RNStyleXProvider>
        ).toJSON()?.props.style
      );
    };

    expect(outputStyle('light')).toMatchObject({
      borderBlockColor: 'white',
    });
    expect(outputStyle('dark')).toMatchObject({
      borderBlockColor: 'gray',
    });
  });
});
