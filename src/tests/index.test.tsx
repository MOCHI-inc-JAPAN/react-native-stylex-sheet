import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import {
  flattenStyles,
  flattenVariantStyles,
  flattenCompoundVariantStyles,
} from '../internals/utils';

import { resolveMediaRangeQueries } from '../internals/media';
import { createStyleSheet, processStyleSheet } from '../internals/styles';
import { createStylex, StyleEntry, StyleInput } from '../internals';
import { mockDimensions, reduceStyles } from './utils';

// ---------------------------------------------------------------------------
// Helpers used by tests that need useStylex()
// ---------------------------------------------------------------------------

type StylexInstance = ReturnType<typeof createStylex>;

function makeComp(
  stylex: StylexInstance,
  entry: StyleEntry,
  variantProps?: Record<string, any>
) {
  return function TestComp() {
    const sx = stylex.useStylex();
    const input: StyleInput = variantProps
      ? sx.variants(entry, variantProps)
      : entry;
    return <View {...sx.props(input)} />;
  };
}

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

describe('Basic', () => {
  it('create() + props() returns base styles', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      view: {
        backgroundColor: 'red',
        height: 100,
        width: 100,
      },
    });

    const { style } = stylex.props(styles.view);
    expect(style[0]).toMatchObject({ backgroundColor: 'red', height: 100, width: 100 });
  });

  it('useStylex().props() renders base styles', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: 100 },
    });

    const Comp = makeComp(stylex, styles.view);
    const { toJSON } = render(<Comp />);
    const result = toJSON();

    expect(result?.type).toEqual('View');
    expect(result?.props.style[0]).toMatchObject({
      backgroundColor: 'red',
      height: 100,
      width: 100,
    });
  });

  it('stylesheet is not recomputed when no runtime theme is used', () => {
    const stylex = createStylex({
      theme: { sizes: { demoWidth: 100 } },
    });
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: '$demoWidth' },
    });

    // Render once to warm the cache
    const Comp = makeComp(stylex, styles.view);
    render(<Comp />);

    // Adding a new theme should NOT affect components not wrapped in ThemeProvider
    stylex.createTheme({ sizes: { demoWidth: 10 } });

    const { toJSON } = render(<Comp />);
    expect(toJSON()?.props.style[0]).toMatchObject({ width: 100 });
  });
});

// ---------------------------------------------------------------------------
// Runtime (ThemeProvider + useStylex)
// ---------------------------------------------------------------------------

describe('Runtime', () => {
  it('ThemeProvider switches the active theme', () => {
    const stylex = createStylex({
      theme: { sizes: { demoWidth: 100 } },
    });
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: '$demoWidth' },
    });
    const newTheme = stylex.createTheme({ sizes: { demoWidth: 30 } });
    const Comp = makeComp(stylex, styles.view);

    const { toJSON } = render(
      <stylex.ThemeProvider theme={newTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );

    expect(toJSON()?.props.style[0]).toMatchObject({ width: 30 });
  });

  it('ThemeProvider uses a newly created theme', () => {
    const stylex = createStylex({
      theme: { sizes: { demoWidth: 100 } },
    });
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: '$demoWidth' },
    });
    const newTheme = stylex.createTheme({ sizes: { demoWidth: 10 } });
    const Comp = makeComp(stylex, styles.view);

    const { toJSON } = render(
      <stylex.ThemeProvider theme={newTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );

    expect(toJSON()?.props.style[0]).toMatchObject({ width: 10 });
  });

  it('ThemeProvider triggers recompute when runtime theme is added', () => {
    const stylex = createStylex({
      theme: { sizes: { demoWidth: 100 } },
    });
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: '$demoWidth' },
    });
    const Comp = makeComp(stylex, styles.view);

    // Render with default theme first (warms cache for theme-1)
    render(<Comp />);

    // Create new theme after first render
    const newTheme = stylex.createTheme({ sizes: { demoWidth: 10 } });

    const { toJSON } = render(
      <stylex.ThemeProvider theme={newTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );

    expect(toJSON()?.props.style[0]).toMatchObject({ width: 10 });
  });

  it('variants() applies correct styles', () => {
    const stylex = createStylex({
      theme: {
        colors: { primary: 'red', secondary: 'blue', tertiary: 'yellow' },
        radii: { sm: 5, md: 10, lg: 15 },
      },
      media: {
        md: '(width >= 750px)',
        lg: '(width >= 1080px)',
        xl: '(width >= 1284px)',
        xxl: '(width >= 1536px)',
      },
    });

    mockDimensions({ width: 1080 });

    const styles = stylex.create({
      view: {
        height: 100,
        width: 100,
        variants: {
          v1: {
            one: {
              backgroundColor: '$primary',
              '@lg': { backgroundColor: 'black' },
            },
            two: { backgroundColor: '$secondary' },
            three: { backgroundColor: '$tertiary' },
          },
          v2: {
            one: { borderColor: '$primary' },
            two: { borderColor: '$secondary' },
            three: { borderColor: '$tertiary' },
          },
        },
        compoundVariants: [
          {
            v1: 'one',
            v2: 'two',
            css: {
              borderRadius: '$sm',
              borderWidth: 1,
              '@md': { color: 'red' },
            },
          },
          {
            v1: 'two',
            v2: 'three',
            css: { borderRadius: '$lg', borderWidth: 2 },
          },
        ],
        defaultVariants: { v1: 'one', v2: 'one' },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return (
        <View {...sx.props(sx.variants(styles.view, { v1: 'one', v2: 'two' }))} />
      );
    }

    const { toJSON } = render(<Comp />);
    expect(reduceStyles(toJSON()?.props.style)).toMatchObject({
      height: 100,
      width: 100,
      backgroundColor: 'black',
      borderColor: 'blue',
      borderRadius: 5,
      borderWidth: 1,
    });
  });
});

// ---------------------------------------------------------------------------
// Media queries
// ---------------------------------------------------------------------------

describe('Media', () => {
  it('Nested utils and media queries with theme values', () => {
    const stylex = createStylex({
      media: {
        md: '(width >= 750px)',
        lg: '(width >= 1080px)',
        xl: '(width >= 1284px)',
        xxl: '(width >= 1536px)',
      },
      utils: {
        util1: (value: number) => ({
          fontSize: value,
          '@md': { fontSize: value / 2 },
          '@lg': { fontSize: value * 2 },
        }),
        util2: (value: number) => ({
          util1: 20,
          width: value,
          height: value,
          '@md': { width: value / 2, height: value / 2 },
          '@lg': { width: value * 2, height: value * 2 },
        }),
      },
    });

    const styles = stylex.create({
      view: {
        backgroundColor: 'yellow',
        color: 'red',
        util2: 100,
        '@md': { color: 'blue' },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
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

  it('Responsive variant props', () => {
    mockDimensions({ width: 1080 });

    const stylex = createStylex({
      media: { md: '(width >= 750px)', lg: '(width >= 1080px)' },
    });

    const styles = stylex.create({
      text: {
        variants: {
          color: {
            primary: { color: 'red' },
            secondary: { color: 'blue' },
          },
        },
      },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return (
        <View
          {...sx.props(
            sx.variants(styles.text, {
              color: { '@initial': 'primary', '@lg': 'secondary' },
            })
          )}
        />
      );
    }

    const { toJSON } = render(<Comp />);
    // @lg is active at width 1080
    expect(reduceStyles(toJSON()?.props.style)).toMatchObject({ color: 'blue' });
  });
});

// ---------------------------------------------------------------------------
// Utils (pure function tests — unchanged from original)
// ---------------------------------------------------------------------------

describe('Utils', () => {
  const utils = {
    util1: (value) => ({
      fontSize: value,
      '@bp1': { fontSize: value / 2 },
      '@bp2': { fontSize: value * 2 },
    }),
    util2: (value) => ({
      util1: 20,
      width: value,
      height: value,
      '@bp2': { width: value * 3, height: value * 3 },
    }),
  };

  it('flattenStyles', () => {
    const result = flattenStyles(
      { color: 'red', util2: 100, '@bp1': { color: 'blue' } },
      utils
    );
    expect(result).toMatchObject({
      color: 'red',
      fontSize: 20,
      width: 100,
      height: 100,
      bp1: { color: 'blue', fontSize: 10 },
      bp2: { fontSize: 40, width: 300, height: 300 },
    });
  });

  it('flattenVariantStyles', () => {
    const result = flattenVariantStyles(
      { v1: { x: { util1: 10 }, y: { util2: 100 } } },
      utils
    );
    expect(result).toMatchObject({
      v1: {
        x: { fontSize: 10, bp1: { fontSize: 5 }, bp2: { fontSize: 20 } },
        y: {
          width: 100,
          height: 100,
          fontSize: 20,
          bp1: { fontSize: 10 },
          bp2: { fontSize: 40, width: 300, height: 300 },
        },
      },
    });
  });

  it('flattenCompoundVariantStyles', () => {
    const result = flattenCompoundVariantStyles(
      [{ v1: 'x', v2: 'y', css: { util2: 100, '@bp1': { color: 'blue' } } }],
      utils
    );
    expect(result).toMatchObject([
      {
        v1: 'x',
        v2: 'y',
        css: {
          width: 100,
          height: 100,
          fontSize: 20,
          bp1: { color: 'blue', fontSize: 10 },
          bp2: { fontSize: 40, width: 300, height: 300 },
        },
      },
    ]);
  });

  it('resolveMediaRangeQueries', () => {
    const media = {
      bp1: '(width >= 640px)',
      bp2: '(width >= 1024px)',
      bp3: '(320px <= width < 1280px)',
      phone: true,
      tablet: false,
    };

    expect(resolveMediaRangeQueries(media, 640)).toMatchObject(['bp1', 'bp3', 'phone']);

    media.phone = false;
    media.tablet = true;
    expect(resolveMediaRangeQueries(media, 1024)).toMatchObject(['bp1', 'bp2', 'bp3', 'tablet']);
    expect(resolveMediaRangeQueries({}, 640)).toMatchObject([]);
    expect(resolveMediaRangeQueries({ bp1: false, bp2: false, bp3: true }, 640)).toMatchObject(['bp3']);
  });

  it('createStyleSheet', () => {
    const theme = {
      colors: { primary: 'red', secondary: 'blue', tertiary: 'yellow' },
      radii: { sm: 5, md: 10, lg: 15 },
    };

    const result = createStyleSheet({
      theme,
      themeMap: undefined,
      styles: { height: 100, width: 100, sm: { height: 50, width: 50 } },
      variants: {
        v1: {
          one: {
            backgroundColor: '$primary',
            sm: { backgroundColor: 'white' },
            md: { backgroundColor: 'black' },
            lg: { backgroundColor: 'pink' },
          },
          two: { backgroundColor: '$secondary' },
          three: { backgroundColor: '$tertiary' },
        },
        v2: {
          one: { borderColor: '$primary' },
          two: { borderColor: '$secondary' },
          three: { borderColor: '$tertiary' },
        },
      },
      compoundVariants: [
        { v1: 'one', v2: 'three', css: { borderRadius: '$sm', borderWidth: 1 } },
        { v1: 'two', v2: 'four', css: { borderRadius: '$lg', borderWidth: 2 } },
      ],
    });

    expect(result).toEqual({
      base: { height: 100, width: 100, sm: { height: 50, width: 50 } },
      v1_one: {
        backgroundColor: 'red',
        sm: { backgroundColor: 'white' },
        md: { backgroundColor: 'black' },
        lg: { backgroundColor: 'pink' },
      },
      v1_two: { backgroundColor: 'blue' },
      v1_three: { backgroundColor: 'yellow' },
      v2_one: { borderColor: 'red' },
      v2_two: { borderColor: 'blue' },
      v2_three: { borderColor: 'yellow' },
      'v1_one+v2_three': { borderRadius: 5, borderWidth: 1 },
      'v1_two+v2_four': { borderRadius: 15, borderWidth: 2 },
    });
  });

  it('processStyleSheet', () => {
    const styleSheet = {
      base: { height: 100, width: 100, sm: { height: 50, width: 50 } },
      v1_one: {
        backgroundColor: 'red',
        sm: { backgroundColor: 'orange' },
        md: { backgroundColor: 'black' },
      },
      v1_two: { backgroundColor: 'blue', lg: { backgroundColor: 'white' } },
      v1_three: { backgroundColor: 'yellow' },
    };
    const media = {
      sm: '(width >= 600px)',
      md: '(width >= 750px)',
      lg: '(width >= 1080px)',
    };

    expect(processStyleSheet(styleSheet, media, ['md', 'lg'])).toEqual({
      base: { height: 100, width: 100 },
      v1_one: { backgroundColor: 'black' },
      v1_two: { backgroundColor: 'white' },
      v1_three: { backgroundColor: 'yellow' },
    });

    expect(processStyleSheet(styleSheet, media, ['sm'])).toEqual({
      base: { height: 50, width: 50 },
      v1_one: { backgroundColor: 'orange' },
      v1_two: { backgroundColor: 'blue' },
      v1_three: { backgroundColor: 'yellow' },
    });
  });
});
