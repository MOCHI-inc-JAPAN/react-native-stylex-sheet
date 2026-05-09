# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**`@mochi-inc-japan/react-native-stylex-sheet`** is a React Native CSS-in-JS library with a StyleX-like API. The `example/` app imports it via the pnpm workspace alias and uses it end-to-end.

React Native has no CSS variables, cascade, inheritance, keyframes, pseudo-elements, or global styles. These features are absent by design. Theming is implemented via React Context instead of CSS variables.

## Commands

```sh
npm run build          # compile to CommonJS + ESM via react-native-builder-bob
npm run watch          # rebuild on changes in src/
npm test               # all Jest tests
npm test -- -t "name"  # run a single test by name
npm test -- src/tests/index.test.tsx  # run a specific file
npm run lint           # ESLint on src/ and example/ in parallel
npm run format:write   # Prettier auto-format
```

Build outputs go to `lib/commonjs/` and `lib/module/`. The source for the build is `src/internals/` (not the entire `src/`), as configured in `package.json`'s `react-native-builder-bob` field.

## API

The library uses a StyleX-like API. Call `createStylex(config)` to get a configured instance:

```ts
const { create, props, useStylex, defineVars, createTheme, ThemeProvider } =
  createStylex({ media, utils });
```

- **`defineVars(defaults)`** — Defines a group of theme variables with default values. Returns `ThemeToken` objects usable as style values in `create()`.
- **`createTheme(vars, overrides)`** — Creates a `ThemeOverride` from a `VarsGroup`. Pass to `ThemeProvider` to activate. All keys of `vars` must be provided in `overrides`.
- **`create(styleDefs)`** — Called at module level. Accepts a map of style definitions (each can have `variants`, `compoundVariants`, `defaultVariants`). Returns a `StyleEntry` map.
- **`props(...styleEntries)`** — Returns `{ style: StyleProp<any> }` to spread on a component. Uses default token values; reads `Dimensions.get()` synchronously (non-reactive for media queries).
- **`useStylex()`** — Hook returning `{ props }` that is reactive to the current `ThemeProvider` theme and `useWindowDimensions()`. Use this inside components when theme-switching or media-reactive behavior is needed.

Usage pattern:

```tsx
// module level
const vars = stylex.defineVars({ padding: 8, color: 'blue' });

const styles = stylex.create({
  button: {
    padding: vars.padding,
    backgroundColor: vars.color,
  },
  sizeSm: { height: 32 },
  sizeLg: { height: 44 },
});

// inside component
function Button({ size }: { size: 'sm' | 'lg' }) {
  const sx = stylex.useStylex();
  return (
    <Pressable
      {...sx.props(
        styles.button,
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg
      )}
    />
  );
}
```

**Variant pattern**: Since `props()` only applies `defaultVariants` automatically, dynamic variants are expressed as separate `StyleEntry` objects passed conditionally to `props()`.

## Architecture

All runtime logic lives in `src/internals/`. Types are declaration files in `src/types/` and are not compiled. The build source (`react-native-builder-bob`) is `src/internals/`.

### Render-time style pipeline

When `useStylex().props(input)` is called inside a component:

1. `useContext(ThemeContext)` reads the current `ThemeOverride` (or `null` for defaults)
2. `resolveEntry()` lazy-creates and caches `StyleSheet.create()` output per theme in `entry._sheets[themeId]`
3. `processStyleSheet()` inlines active media query styles into the flat sheet (computed from `useWindowDimensions()` + `PixelRatio`)
4. `resolveVariantStylesList()` and `resolveCompoundVariantStylesList()` look up pre-computed styles by key (e.g. `color_primary`, `v1_one+v2_two`)
5. Returns `{ style: [base, ...variantStyles, ...compoundStyles] }` — always an array

For the static `props()` (no hook), step 3 uses `Dimensions.get('window')` synchronously — non-reactive on dimension changes.

### Key design details

**Token resolution** (`src/internals/styles.ts` `resolveTokensDeep`): Style values that are `ThemeToken` objects (from `defineVars()`) are replaced with their resolved values at `StyleSheet.create()` time. Without a `ThemeProvider`, `token.__default` is used.

**Utils are recursive**: `flattenStyles()` in `src/internals/utils.ts` expands util functions before storing styles. A util can call other utils; media keys (`@bp1`) are stripped of `@` and stored as nested objects at flatten time.

**Compound variant keys** are alphabetically sorted and joined: `color_primary+size_small`. Key ordering is deterministic regardless of definition order.

**Media query order matters**: Responsive styles are applied in the order of `Object.entries(media)`. Later active queries overwrite earlier ones, so put more specific queries last.

**`defineVars` / `createTheme`**: `defineVars` assigns each token a unique `__varId`. `createTheme(vars, overrides)` builds a `ThemeOverride` that maps `__varId` → resolved value, which `useStylex()` applies when computing styles.

### Unsupported token types

`shadows` (iOS/Android have incompatible APIs) and `transitions` are intentionally excluded. Use `utils` to implement shadow helpers.

## Example app

The `example/` app uses `@mochi-inc-japan/react-native-stylex-sheet` (workspace package). Styles are configured in `example/src/styles/styled.ts` which exports `create`, `props`, `useStylex`, `ThemeProvider`, `vars`, and `darkTheme`. Components import exclusively from `../styles`, not directly from the package.
