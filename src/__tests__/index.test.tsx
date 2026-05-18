import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as stylex from '../';
import { Variants } from '../utils/types';
import { finalStyle, reduceStyles } from './utils/test-utils';

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

    expect(stylex.props(styles.view, { ...styles.view2 }).style).toMatchObject([
      orgStyles.view,
      orgStyles.view2,
    ]);
  });

  it('useStylex().props() has backward compatibility on StyleSheet', () => {
    const sameArgs = {
      view: { backgroundColor: 'red', height: 100, width: 100 },
      view2: { height: 200, width: 200 },
    };
    const styles = stylex.create(sameArgs);

    const orgStyles = StyleSheet.create(sameArgs);

    function Comp1() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view, styles.view2)} />;
    }

    // cached style object
    expect(
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp1 />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject(reduceStyles([orgStyles.view, orgStyles.view2]));

    // dynamic style object
    function Comp2() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view, { ...sameArgs.view2 })} />;
    }

    expect(
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp2 />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject(reduceStyles([orgStyles.view, orgStyles.view2]));
  });

  it('stylex.flatten() has backward compatibility on StyleSheet', () => {
    const sameArgs = {
      view: { backgroundColor: 'red', height: 100, width: 100 },
      view2: { height: 200, width: 200 },
    };
    const styles = stylex.create(sameArgs);

    const orgStyles = StyleSheet.create(sameArgs);

    expect(stylex.flatten(styles.view, styles.view2)).toMatchObject(
      StyleSheet.flatten([orgStyles.view, orgStyles.view2])
    );
  });
  it('useStylex().flatten() can be used with TouchOpacity', () => {
    const variants = stylex.createVariants({
      shape: {
        borderRadius: {
          round: 8,
        },
      },
    });

    const styles = stylex.create({
      op: {
        backgroundColor: 'red',
        height: 100,
        width: 100,
        ...variants.shape,
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return (
        <View style={sx.flatten(sx.mix(styles.op, { shape: 'round' }))}>
          <Text>test</Text>
        </View>
      );
    }

    expect(
      render(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
      ).toJSON()?.props.style
    ).toMatchObject({
      backgroundColor: 'red',
      height: 100,
      width: 100,
      borderRadius: 8,
    });
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
// Theme queries
// ---------------------------------------------------------------------------

describe('Theme', () => {
  it('theme usage implicitly', () => {
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
      return <View {...sx.props(styles.view)} />;
    }

    const outputStyle = (theme: keyof typeof themes) => {
      return finalStyle(
        <stylex.RNStyleXProvider theme={themes[theme]}>
          <Comp />
        </stylex.RNStyleXProvider>
      );
    };

    expect(outputStyle('light')).toMatchObject({
      borderBlockColor: 'white',
    });
    expect(outputStyle('dark')).toMatchObject({
      borderBlockColor: 'gray',
    });
  });

  it('theme usage implicitly', () => {
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
      return finalStyle(
        <stylex.RNStyleXProvider theme={themes[theme]}>
          <Comp />
        </stylex.RNStyleXProvider>
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
