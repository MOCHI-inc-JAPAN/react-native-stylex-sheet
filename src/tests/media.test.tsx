import React from 'react';
import { View } from 'react-native';

import * as stylex from '../';
import { mockDimensions, finalStyle } from './test-utils';

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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject({
      backgroundColor: 'yellow',
    });
  });

  it('usage from hooks implicitly', () => {
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
      return <View {...sx.props(styles.view)} />;
    }

    mockDimensions({ width: 750 });
    expect(
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject({
      backgroundColor: 'blue',
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
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
      finalStyle(
        <stylex.RNStyleXProvider>
          <Comp />
        </stylex.RNStyleXProvider>
      )
    ).toMatchObject({
      backgroundColor: 'purple',
      height: 100,
    });
  });
});
