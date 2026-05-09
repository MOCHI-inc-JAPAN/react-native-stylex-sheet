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
import {
  createStylex,
  defineVars,
  defineConsts,
} from '../internals';
import { mockDimensions, reduceStyles } from './utils';

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
    expect(style[0]).toMatchObject({
      backgroundColor: 'red',
      height: 100,
      width: 100,
    });
  });

  it('useStylex().props() renders base styles', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: 100 },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view)} />;
    }

    const { toJSON } = render(<Comp />);
    expect(toJSON()?.props.style[0]).toMatchObject({
      backgroundColor: 'red',
      height: 100,
      width: 100,
    });
  });

  it('stylesheet is not recomputed when no ThemeProvider is used', () => {
    const vars = defineVars({ demoWidth: 100 });
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view)} />;
    }

    render(<Comp />);

    // Creating a new theme should NOT affect components not in ThemeProvider
    stylex.createTheme(vars, { demoWidth: 10 });

    const { toJSON } = render(<Comp />);
    expect(toJSON()?.props.style[0]).toMatchObject({ width: 100 });
  });
});

// ---------------------------------------------------------------------------
// Token resolution (defineVars + createTheme + ThemeProvider)
// ---------------------------------------------------------------------------

describe('Token resolution', () => {
  it('ThemeToken defaults are used without ThemeProvider', () => {
    const vars = defineVars({ color: 'red', size: 100 });
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: vars.color, width: vars.size },
    });

    const { style } = stylex.props(styles.view);
    expect(style[0]).toMatchObject({ backgroundColor: 'red', width: 100 });
  });

  it('ThemeProvider overrides token values', () => {
    const vars = defineVars({ demoWidth: 100 });
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
    });
    const newTheme = stylex.createTheme(vars, { demoWidth: 30 });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view)} />;
    }

    const { toJSON } = render(
      <stylex.ThemeProvider theme={newTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );

    expect(toJSON()?.props.style[0]).toMatchObject({ width: 30 });
  });

  it('multiple createTheme calls produce independent overrides', () => {
    const vars = defineVars({ demoWidth: 100 });
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
    });
    const themeA = stylex.createTheme(vars, { demoWidth: 10 });
    const themeB = stylex.createTheme(vars, { demoWidth: 50 });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view)} />;
    }

    const { toJSON: toJSONA } = render(
      <stylex.ThemeProvider theme={themeA}>
        <Comp />
      </stylex.ThemeProvider>
    );
    expect(toJSONA()?.props.style[0]).toMatchObject({ width: 10 });

    const { toJSON: toJSONB } = render(
      <stylex.ThemeProvider theme={themeB}>
        <Comp />
      </stylex.ThemeProvider>
    );
    expect(toJSONB()?.props.style[0]).toMatchObject({ width: 50 });
  });

  it('ThemeProvider triggers recompute when theme changes after first render', () => {
    const vars = defineVars({ demoWidth: 100 });
    const stylex = createStylex();
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
    });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.view)} />;
    }

    render(<Comp />);

    const newTheme = stylex.createTheme(vars, { demoWidth: 10 });

    const { toJSON } = render(
      <stylex.ThemeProvider theme={newTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );

    expect(toJSON()?.props.style[0]).toMatchObject({ width: 10 });
  });
});

// ---------------------------------------------------------------------------
// defineConsts
// ---------------------------------------------------------------------------

describe('defineConsts', () => {
  it('returns a frozen object with the given values', () => {
    const consts = defineConsts({ maxWidth: 1200, spacing: 8, label: 'hello' });
    expect(consts.maxWidth).toBe(1200);
    expect(consts.spacing).toBe(8);
    expect(consts.label).toBe('hello');
    expect(Object.isFrozen(consts)).toBe(true);
  });

  it('constant values can be used directly in styles', () => {
    const consts = defineConsts({ buttonHeight: 48 });
    const stylex = createStylex();
    const styles = stylex.create({
      button: { height: consts.buttonHeight },
    });

    const { style } = stylex.props(styles.button);
    expect(style[0]).toMatchObject({ height: 48 });
  });
});

// ---------------------------------------------------------------------------
// Variadic props (StyleX variants recipe)
// ---------------------------------------------------------------------------

describe('Variadic props', () => {
  it('props() accepts multiple StyleEntry args', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      base: { height: 100, width: 100 },
      highlighted: { backgroundColor: 'yellow' },
    });

    const { style } = stylex.props(styles.base, styles.highlighted);
    expect(reduceStyles(style)).toMatchObject({
      height: 100,
      width: 100,
      backgroundColor: 'yellow',
    });
  });

  it('props() skips falsy items', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      base: { height: 100 },
      extra: { height: 200 },
    });

    const { style } = stylex.props(styles.base, false, null, undefined);
    expect(reduceStyles(style)).toMatchObject({ height: 100 });
  });

  it('useStylex().props() handles multiple entries with tokens', () => {
    const vars = defineVars({ primary: 'red' });
    const stylex = createStylex();
    const styles = stylex.create({
      base: { height: 100, width: 100 },
      colored: { backgroundColor: vars.primary },
    });
    const darkTheme = stylex.createTheme(vars, { primary: 'navy' });

    function Comp() {
      const sx = stylex.useStylex();
      return <View {...sx.props(styles.base, styles.colored)} />;
    }

    const { toJSON } = render(
      <stylex.ThemeProvider theme={darkTheme}>
        <Comp />
      </stylex.ThemeProvider>
    );
    expect(reduceStyles(toJSON()?.props.style)).toMatchObject({
      height: 100,
      backgroundColor: 'navy',
    });
  });

  it('defaultVariants are applied automatically', () => {
    const stylex = createStylex();
    const styles = stylex.create({
      button: {
        height: 40,
        variants: {
          size: {
            sm: { height: 32 },
            lg: { height: 56 },
          },
        },
        defaultVariants: { size: 'lg' },
      },
    });

    const { style } = stylex.props(styles.button);
    expect(reduceStyles(style)).toMatchObject({ height: 56 });
  });
});

// ---------------------------------------------------------------------------
// Media queries
// ---------------------------------------------------------------------------

describe('Media', () => {
  it('Nested utils and media queries', () => {
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
          {...sx.props(
            !useLg && styles.primary,
            useLg && styles.secondary
          )}
        />
      );
    }

    const { toJSON } = render(<Comp useLg={true} />);
    expect(reduceStyles(toJSON()?.props.style)).toMatchObject({ color: 'blue' });

    const { toJSON: toJSON2 } = render(<Comp useLg={false} />);
    expect(reduceStyles(toJSON2()?.props.style)).toMatchObject({ color: 'red' });
  });
});

// ---------------------------------------------------------------------------
// Utils (pure function tests — unchanged from original)
// ---------------------------------------------------------------------------

describe('Utils', () => {
  const utils = {
    util1: (value: number) => ({
      fontSize: value,
      '@bp1': { fontSize: value / 2 },
      '@bp2': { fontSize: value * 2 },
    }),
    util2: (value: number) => ({
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

    expect(resolveMediaRangeQueries(media, 640)).toMatchObject([
      'bp1',
      'bp3',
      'phone',
    ]);

    media.phone = false;
    media.tablet = true;
    expect(resolveMediaRangeQueries(media, 1024)).toMatchObject([
      'bp1',
      'bp2',
      'bp3',
      'tablet',
    ]);
    expect(resolveMediaRangeQueries({}, 640)).toMatchObject([]);
    expect(
      resolveMediaRangeQueries({ bp1: false, bp2: false, bp3: true }, 640)
    ).toMatchObject(['bp3']);
  });

  it('createStyleSheet with token values', () => {
    const vars = defineVars({
      primary: 'red',
      secondary: 'blue',
      tertiary: 'yellow',
      sm: 5,
      lg: 15,
    });

    const tokenValues = Object.fromEntries(
      (Object.values(vars) as any[]).map((t) => [t.__varId, t.__default])
    ) as Record<string, string | number>;

    const result = createStyleSheet({
      tokenValues,
      styles: { height: 100, width: 100, sm: { height: 50, width: 50 } },
      variants: {
        v1: {
          one: {
            backgroundColor: vars.primary,
            sm: { backgroundColor: 'white' },
            md: { backgroundColor: 'black' },
            lg: { backgroundColor: 'pink' },
          },
          two: { backgroundColor: vars.secondary },
          three: { backgroundColor: vars.tertiary },
        },
        v2: {
          one: { borderColor: vars.primary },
          two: { borderColor: vars.secondary },
          three: { borderColor: vars.tertiary },
        },
      },
      compoundVariants: [
        {
          v1: 'one',
          v2: 'three',
          css: { borderRadius: vars.sm, borderWidth: 1 },
        },
        {
          v1: 'two',
          v2: 'four',
          css: { borderRadius: vars.lg, borderWidth: 2 },
        },
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
