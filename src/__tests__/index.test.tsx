import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as stylex from '../';
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

  it('stylex.create() treats array style values as plain default values', () => {
    const styles = stylex.create({
      view: {
        boxShadow: [{
          offsetX: 0,
          offsetY: 0,
          blurRadius: 10,
          color: 'black',
          spreadDistance: 0,
        }]
      },
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

  it('stylex.create() treats plain objects (no variant keys) as default values', () => {
    const styles = stylex.create({
      view: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
    });

    const { style } = stylex.props(styles.view);
    expect(style[0]).toMatchObject({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
    });
  });

  it('stylex.create() applies variants to plain-object style values like shadowOffset', () => {
    const { themes } = stylex.createThemes(['light', 'dark']);

    const styles = stylex.create({
      view: {
        shadowOffset: {
          default: { width: 0, height: 2 },
          [themes.dark]: { width: 0, height: 4 },
        },
        shadowOpacity: 0.1,
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(sx.mix(styles.view))} />;
    }

    expect(
      finalStyle(
        <stylex.RNStyleXProvider theme={themes.dark}>
          <Comp />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject({
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
    });

    expect(
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject({
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
    });
  });

  it('stylex.create() throws when variant and non-variant keys are mixed', () => {
    expect(() =>
      stylex.create({
        view: {
          padding: {
            default: 12,
            width: 100,
          } as any,
        },
      })
    ).toThrow(/mixes variant keys.*with non-variant keys/);
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
