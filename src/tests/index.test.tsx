import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import * as stylex from '../';

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

  it('useStylex().props() renders base styles', () => {
    const styles = stylex.create({
      view: { backgroundColor: 'red', height: 100, width: 100 },
      view2: { height: 200, width: 200 },
    });

    console.log(stylex.props(styles.view, styles.view2))
    function Comp() {
      return <View  style={ [
        { backgroundColor: 'red', height: 100, width: 100 },
        { height: 200, width: 200 }
      ]} />;
    }

    const { toJSON } = render(<Comp />);
    expect(toJSON()?.props.style[0]).toMatchObject({
      backgroundColor: 'red',
      height: 200,
      width: 200,
    });
  });
});

// ---------------------------------------------------------------------------
// Token resolution (defineVars + createTheme + ThemeProvider)
// ---------------------------------------------------------------------------

// describe('Token resolution', () => {
//   it('ThemeToken defaults are used without ThemeProvider', () => {
//     const vars = defineVars({ color: 'red', size: 100 });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       view: { backgroundColor: vars.color, width: vars.size },
//     });

//     const { style } = stylex.props(styles.view);
//     expect(style[0]).toMatchObject({ backgroundColor: 'red', width: 100 });
//   });

//   it('ThemeProvider overrides token values', () => {
//     const vars = defineVars({ demoWidth: 100 });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
//     });
//     const newTheme = stylex.createTheme(vars, { demoWidth: 30 });

//     function Comp() {
//       const sx = stylex.useStylex();
//       return <View {...sx.props(styles.view)} />;
//     }

//     const { toJSON } = render(
//       <stylex.ThemeProvider theme={newTheme}>
//         <Comp />
//       </stylex.ThemeProvider>
//     );

//     expect(toJSON()?.props.style[0]).toMatchObject({ width: 30 });
//   });

//   it('multiple createTheme calls produce independent overrides', () => {
//     const vars = defineVars({ demoWidth: 100 });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
//     });
//     const themeA = stylex.createTheme(vars, { demoWidth: 10 });
//     const themeB = stylex.createTheme(vars, { demoWidth: 50 });

//     function Comp() {
//       const sx = stylex.useStylex();
//       return <View {...sx.props(styles.view)} />;
//     }

//     const { toJSON: toJSONA } = render(
//       <stylex.ThemeProvider theme={themeA}>
//         <Comp />
//       </stylex.ThemeProvider>
//     );
//     expect(toJSONA()?.props.style[0]).toMatchObject({ width: 10 });

//     const { toJSON: toJSONB } = render(
//       <stylex.ThemeProvider theme={themeB}>
//         <Comp />
//       </stylex.ThemeProvider>
//     );
//     expect(toJSONB()?.props.style[0]).toMatchObject({ width: 50 });
//   });

//   it('ThemeProvider triggers recompute when theme changes after first render', () => {
//     const vars = defineVars({ demoWidth: 100 });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       view: { backgroundColor: 'red', height: 100, width: vars.demoWidth },
//     });

//     function Comp() {
//       const sx = stylex.useStylex();
//       return <View {...sx.props(styles.view)} />;
//     }

//     render(<Comp />);

//     const newTheme = stylex.createTheme(vars, { demoWidth: 10 });

//     const { toJSON } = render(
//       <stylex.ThemeProvider theme={newTheme}>
//         <Comp />
//       </stylex.ThemeProvider>
//     );

//     expect(toJSON()?.props.style[0]).toMatchObject({ width: 10 });
//   });
// });

// // ---------------------------------------------------------------------------
// // defineConsts
// // ---------------------------------------------------------------------------

// describe('defineConsts', () => {
//   it('returns a frozen object with the given values', () => {
//     const consts = defineConsts({ maxWidth: 1200, spacing: 8, label: 'hello' });
//     expect(consts.maxWidth).toBe(1200);
//     expect(consts.spacing).toBe(8);
//     expect(consts.label).toBe('hello');
//     expect(Object.isFrozen(consts)).toBe(true);
//   });

//   it('constant values can be used directly in styles', () => {
//     const consts = defineConsts({ buttonHeight: 48 });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       button: { height: consts.buttonHeight },
//     });

//     const { style } = stylex.props(styles.button);
//     expect(style[0]).toMatchObject({ height: 48 });
//   });
// });

// // ---------------------------------------------------------------------------
// // Variadic props (StyleX variants recipe)
// // ---------------------------------------------------------------------------

// describe('Variadic props', () => {
//   it('props() accepts multiple StyleEntry args', () => {
//     const stylex = createStylex();
//     const styles = stylex.create({
//       base: { height: 100, width: 100 },
//       highlighted: { backgroundColor: 'yellow' },
//     });

//     const { style } = stylex.props(styles.base, styles.highlighted);
//     expect(reduceStyles(style)).toMatchObject({
//       height: 100,
//       width: 100,
//       backgroundColor: 'yellow',
//     });
//   });

//   it('props() skips falsy items', () => {
//     const stylex = createStylex();
//     const styles = stylex.create({
//       base: { height: 100 },
//       extra: { height: 200 },
//     });

//     const { style } = stylex.props(styles.base, false, null, undefined);
//     expect(reduceStyles(style)).toMatchObject({ height: 100 });
//   });

//   it('useStylex().props() handles multiple entries with tokens', () => {
//     const vars = defineVars({ primary: 'red' });
//     const stylex = createStylex();
//     const styles = stylex.create({
//       base: { height: 100, width: 100 },
//       colored: { backgroundColor: vars.primary },
//     });
//     const darkTheme = stylex.createTheme(vars, { primary: 'navy' });

//     function Comp() {
//       const sx = stylex.useStylex();
//       return <View {...sx.props(styles.base, styles.colored)} />;
//     }

//     const { toJSON } = render(
//       <stylex.ThemeProvider theme={darkTheme}>
//         <Comp />
//       </stylex.ThemeProvider>
//     );
//     expect(reduceStyles(toJSON()?.props.style)).toMatchObject({
//       height: 100,
//       backgroundColor: 'navy',
//     });
//   });
// });

// // ---------------------------------------------------------------------------
// // Media queries
// // ---------------------------------------------------------------------------

// describe('Media', () => {
//   it('Nested utils and media queries', () => {
//     const stylex = createStylex({
//       media: {
//         md: '(width >= 750px)',
//         lg: '(width >= 1080px)',
//         xl: '(width >= 1284px)',
//         xxl: '(width >= 1536px)',
//       },
//       utils: {
//         util1: (value: number) => ({
//           fontSize: value,
//           '@md': { fontSize: value / 2 },
//           '@lg': { fontSize: value * 2 },
//         }),
//         util2: (value: number) => ({
//           util1: 20,
//           width: value,
//           height: value,
//           '@md': { width: value / 2, height: value / 2 },
//           '@lg': { width: value * 2, height: value * 2 },
//         }),
//       },
//     });

//     const styles = stylex.create({
//       view: {
//         backgroundColor: 'yellow',
//         color: 'red',
//         util2: 100,
//         '@md': { color: 'blue' },
//       },
//     });

//     function Comp() {
//       const sx = stylex.useStylex();
//       return <View {...sx.props(styles.view)} />;
//     }

//     mockDimensions({ width: 640 });
//     expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
//       backgroundColor: 'yellow',
//       color: 'red',
//       width: 100,
//       height: 100,
//       fontSize: 20,
//     });

//     mockDimensions({ width: 750 });
//     expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
//       backgroundColor: 'yellow',
//       color: 'blue',
//       fontSize: 10,
//       width: 50,
//       height: 50,
//     });

//     mockDimensions({ width: 1080 });
//     expect(reduceStyles(render(<Comp />).toJSON()?.props.style)).toMatchObject({
//       backgroundColor: 'yellow',
//       color: 'blue',
//       fontSize: 40,
//       width: 200,
//       height: 200,
//     });
//   });

//   it('Conditional styles simulate responsive variants', () => {
//     mockDimensions({ width: 1080 });

//     const stylex = createStylex({
//       media: { md: '(width >= 750px)', lg: '(width >= 1080px)' },
//     });

//     const styles = stylex.create({
//       primary: { color: 'red' },
//       secondary: { color: 'blue' },
//     });

//     function Comp({ useLg }: { useLg: boolean }) {
//       const sx = stylex.useStylex();
//       return (
//         <View
//           {...sx.props(!useLg && styles.primary, useLg && styles.secondary)}
//         />
//       );
//     }

//     const { toJSON } = render(<Comp useLg={true} />);
//     expect(reduceStyles(toJSON()?.props.style)).toMatchObject({
//       color: 'blue',
//     });

//     const { toJSON: toJSON2 } = render(<Comp useLg={false} />);
//     expect(reduceStyles(toJSON2()?.props.style)).toMatchObject({
//       color: 'red',
//     });
//   });
// });
