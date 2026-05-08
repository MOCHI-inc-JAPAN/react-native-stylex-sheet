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

## Architecture

All runtime logic lives in `src/internals/`. Types are declaration files in `src/types/` and are not compiled.

### Render-time style pipeline

When a `styled()` component renders:

1. `useThemeInternal()` reads the current theme from React Context
2. `createStyleSheet()` is called once per theme (cached in `styleSheets[theme.__ID__]` via `useMemo`) — this pre-processes all base/variant/compound-variant styles by resolving theme tokens into actual values via `StyleSheet.create()`
3. `useMediaQueries()` evaluates active breakpoints against `useWindowDimensions()` width (corrected by `PixelRatio`)
4. `useProcessedStyleSheet()` inlines active media query styles into the flat stylesheet
5. `useVariantStyles()` and `useCompoundVariantStyles()` look up pre-computed styles from the flat sheet by key (e.g. `color_primary`, `color_primary+size_small`)
6. Final `style` prop is: `[base, ...variantStyles, ...compoundVariantStyles, cssStyles, props.style]`

### Key design details

**Token resolution** (`src/internals/styles.ts` `processStyles`): `$token` syntax resolves via `themeMap` (CSS property → scale mapping). `$scale$token` resolves explicitly. Negative tokens (`$-space$2`) are handled by checking for a `-` sign segment.

**Utils are recursive**: `flattenStyles()` in `src/internals/utils.ts` expands util functions before storing styles. A util can call other utils; media keys (`@bp1`) are stripped of `@` and stored as nested objects at flatten time.

**Compound variant keys** are alphabetically sorted and joined: `color_primary+size_small`. Key ordering is deterministic regardless of definition order.

**Token aliases require `as const`**: To get the resolved type (e.g. `number`) when accessing an aliased token via `useTheme()`, the alias value must be typed `as const` in the config. Without it, TypeScript infers `string`.

**Media query order matters**: Responsive styles are applied in the order of `Object.entries(media)`. Later active queries overwrite earlier ones, so put more specific queries last.

**Theming without ThemeProvider**: `useTheme()` throws if `ThemeProvider` is absent. The context default is `themes[0].definition` (the initial theme), so `ThemeProvider` is required even when using only the default theme if `useTheme()` is called.

**`processTheme()` produces two structures**: `definition` (token objects with `.toString()` returning `$token`, used in JSX theme context value) and `values` (resolved primitives, used for actual style computation and passed to `.attrs()` callbacks).

### Unsupported token types

`shadows` (iOS/Android have incompatible APIs) and `transitions` are intentionally excluded. Use `utils` to implement shadow helpers.