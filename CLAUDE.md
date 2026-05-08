# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Stitches Native** (`stitches-native` on npm) is a React Native CSS-in-JS library porting [Stitches](https://stitches.dev/) to iOS/Android. This repo (`react-native-stylex-sheet`) is a fork with TypeScript-migrated internals.

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
const { create, props, variants, useStylex, theme, createTheme, ThemeProvider, useTheme } = createStylex({ theme, media, utils, themeMap });
```

- **`create(styleDefs)`** — Called at module level. Accepts a map of style definitions (each can have `variants`, `compoundVariants`, `defaultVariants`). Returns a `StyleEntry` map.
- **`props(styleEntry | variantSpec)`** — Returns `{ style: StyleObject[] }` to spread on a component. Uses the default theme; reads `Dimensions.get()` synchronously (non-reactive for media queries).
- **`variants(entry, variantProps)`** — Wraps a `StyleEntry` with variant prop values (supports responsive objects like `{ '@initial': 'sm', '@md': 'lg' }`). Pass the result to `props()`.
- **`useStylex()`** — Hook returning `{ props, variants }` that are reactive to the current `ThemeProvider` theme and `useWindowDimensions()`. Use this inside components when theme-switching or media-reactive behavior is needed.

Usage pattern:

```tsx
// module level
const styles = stylex.create({
  button: {
    padding: '$2',
    variants: {
      size: { sm: { padding: '$1' }, lg: { padding: '$3' } },
    },
  },
});

// inside component
function Button({ size }) {
  const sx = stylex.useStylex();
  return <Pressable {...sx.props(sx.variants(styles.button, { size }))} />;
}
```

## Architecture

All runtime logic lives in `src/internals/`. Types are declaration files in `src/types/` and are not compiled. The build source (`react-native-builder-bob`) is `src/internals/`.

### Render-time style pipeline

When `useStylex().props(input)` is called inside a component:

1. `useThemeInternal()` reads the current theme from React Context
2. `resolveProps()` lazy-creates and caches `StyleSheet.create()` output per theme in `entry._sheets[themeId]`
3. `processStyleSheet()` inlines active media query styles into the flat sheet (computed from `useWindowDimensions()` + `PixelRatio`)
4. `resolveVariantStylesList()` and `resolveCompoundVariantStylesList()` look up pre-computed styles by key (e.g. `color_primary`, `v1_one+v2_two`)
5. Returns `{ style: [base, ...variantStyles, ...compoundStyles] }` — always an array

For the static `props()` (no hook), step 3 uses `Dimensions.get('window')` synchronously — non-reactive on dimension changes.

### Key design details

**Token resolution** (`src/internals/styles.ts` `processStyles`): `$token` syntax resolves via `themeMap` (CSS property → scale mapping). `$scale$token` resolves explicitly. Negative tokens (`$-space$2`) are handled by checking for a `-` sign segment.

**Utils are recursive**: `flattenStyles()` in `src/internals/utils.ts` expands util functions before storing styles. A util can call other utils; media keys (`@bp1`) are stripped of `@` and stored as nested objects at flatten time.

**Compound variant keys** are alphabetically sorted and joined: `color_primary+size_small`. Key ordering is deterministic regardless of definition order.

**Token aliases require `as const`**: To get the resolved type (e.g. `number`) when accessing an aliased token via `useTheme()`, the alias value must be typed `as const` in the config. Without it, TypeScript infers `string`.

**Media query order matters**: Responsive styles are applied in the order of `Object.entries(media)`. Later active queries overwrite earlier ones, so put more specific queries last.

**`processTheme()` produces two structures**: `definition` (token objects with `.toString()` returning `$token`, used as the ThemeContext value) and `values` (resolved primitives, used for `StyleSheet.create()` and passed to `useTheme()`).

### Unsupported token types

`shadows` (iOS/Android have incompatible APIs) and `transitions` are intentionally excluded. Use `utils` to implement shadow helpers.