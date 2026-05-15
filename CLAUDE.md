# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**`@mochi-inc-japan/react-native-stylex-sheet`** is a React Native CSS-in-JS library with a StyleX-inspired API. The `example/` app imports it via the pnpm workspace alias and uses it end-to-end.

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

### Exports (`src/index.ts`)

```ts
export { create, props, mix } from './utils/base';
export { createVariants } from './utils/variant';
export { defineConsts, defineVars } from './utils/tokens';
export { useStylex, RNStylexProvider } from './utils/hooks';
export { createThemes } from './utils/theme';
export type { Variants, XRNStyle, RNStyle, XRNStyleSheets } from './utils/types';
```

There is no `createStylex()` factory. All functions are imported directly.

### Core concept: variant-keyed style objects

A style property value can be a plain React Native value or a **variant-keyed object** whose keys select which value applies at render time:

| Key form | When it applies |
|---|---|
| `'default'` | Always (the base value) |
| `'(width >= 750px)'` | When screen width matches the media range |
| `themes.dark` (e.g. `'@@theme_dark'`) | When that theme is active in `RNStylexProvider` |
| `'@color_danger'` (from `createVariants`) | When that variant is selected via `mix()` |

### Usage pattern

```tsx
// module level
const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
});

const { themes } = createThemes(['light', 'dark']);

const buttonVariants = createVariants({
  color: {
    backgroundColor: {
      default: '#6200ee',
      danger: '#b00020',
    },
  },
});

const styles = create({
  button: {
    ...buttonVariants.color,
    padding: {
      default: 12,
      [media.md]: 16,
    },
    borderColor: {
      default: 'transparent',
      [themes.dark]: '#fff',
    },
  },
});

// inside component
function Button({ danger }: { danger?: boolean }) {
  const sx = useStylex();
  return (
    <Pressable
      {...sx.props(
        sx.mix<Variants<typeof buttonVariants>>(styles.button, {
          color: danger ? 'danger' : 'default',
        })
      )}
    />
  );
}

// app root
function App() {
  return (
    <RNStylexProvider theme={themes.dark}>
      <Button />
    </RNStylexProvider>
  );
}
```

### Key functions

- **`defineConsts(obj)`** / **`defineVars(obj)`** — Returns a frozen copy of the object. Identical at runtime (`defineVars` is an alias). Used to define shared constants such as media query strings.
- **`createVariants(variantDefs)`** — Transforms variant group definitions into style property objects with keys like `@groupName_variantValue`. The output can be spread into `create()`.
- **`create(styleDefs)`** — Compiles a map of style definitions via `bundleStyleSheet()`, which inverts the variant-keyed structure into a `VariantStyleSheet` (keyed by variant key, not by property name). Calls `StyleSheet.create()` internally.
- **`mix(target, variantArgs?)`** — Resolves a compiled style entry: always includes `default`, then appends matching variant styles. When called as `sx.mix()` from `useStylex()`, also auto-applies the active theme and media width from `RNStylexProvider`.
- **`props(...args)`** — Flattens compiled style entries and `RNStyle[]` arrays into `{ style: [...] }`. Uses the `default` key from each entry. No reactivity.
- **`createThemes(names)`** — Creates opaque theme key strings (`@@theme_<name>`) and returns `{ themes: { [name]: key } }`. Pass a theme key to `RNStylexProvider` to activate it.
- **`RNStylexProvider`** — Context provider. Reads `useWindowDimensions()`, corrects width via `PixelRatio`, and supplies `{ width, theme, props, mix }` through `RNStylexContext`. Required parent for `useStylex()`.
- **`useStylex()`** — Reads `RNStylexContext`; throws if no provider is present. Returns `{ props, mix, width, theme }` where `mix` is pre-bound to the current theme and corrected pixel width.

## Architecture

All runtime logic lives in `src/utils/`. Types are in `src/utils/types.ts`. The build source (`react-native-builder-bob`) is `src/internals/`.

### File map

| File | Responsibility |
|---|---|
| `src/utils/base.ts` | `create`, `props`, `mix`, `bundleStyleSheet` |
| `src/utils/variant.ts` | `createVariants`, `variants` (resolver), `createVariantKey` |
| `src/utils/tokens.ts` | `defineVars`, `defineConsts` |
| `src/utils/theme.ts` | `createThemes`, `getThemeKey`, `resolveTheme` |
| `src/utils/media.ts` | `media` (resolver), `matchMediaRangeQuery` |
| `src/utils/hooks.ts` | `RNStylexProvider`, `useStylex` |
| `src/utils/types.ts` | TypeScript types |

### Render-time style pipeline

When `useStylex().mix(entry, variantArgs)` is called:

1. `RNStylexProvider` supplies `width` (pixel-corrected) and `theme` via context.
2. `mix([entry, { theme, media: width }], variantArgs)` is called.
3. `default` style is always included first.
4. If `theme` is set, `resolveTheme(entry, theme)` looks up the theme-keyed style.
5. If `variantArgs` is provided, `variants(entry, variantArgs)` looks up `@groupName_value` keys.
6. `media(entry, width)` iterates all keys, running `matchMediaRangeQuery` against each, and appends matching styles.
7. Returns `RNStyle[]`.

For the static `props()`, no theme or media resolution occurs — only the `default` key is used.

### `bundleStyleSheet` (in `base.ts`)

`create()` calls `bundleStyleSheet()` for each style definition. It inverts the structure:

**Input** (property → variant keys → values):
```ts
{ backgroundColor: { default: 'white', [themes.dark]: 'black' }, padding: 8 }
```

**Output** (variant key → property → value), passed to `StyleSheet.create()`:
```ts
{ default: { backgroundColor: 'white', padding: 8 }, '@@theme_dark': { backgroundColor: 'black' } }
```

### Variant key format

- Variant keys from `createVariants`: `@<groupName>_<variantValue>` (e.g. `@color_danger`)
- Theme keys from `createThemes`: `@@theme_<themeName>` (e.g. `@@theme_dark`)
- Media keys: the raw CSS range query string (e.g. `(width >= 750px)`)

### Media query matching (`media.ts`)

`matchMediaRangeQuery(key, windowWidth)` supports:
- `(width >= Npx)` / `(width > Npx)` / `(width <= Npx)` / `(width < Npx)`
- `(Apx <= width < Bpx)` and similar range forms

Non-matching keys (e.g. variant keys, theme keys) simply return `false` and are skipped.

### Unsupported features

`shadows` (iOS/Android have incompatible APIs) and `transitions` are intentionally excluded.

## Example app

The `example/` app uses `@mochi-inc-japan/react-native-stylex-sheet` (workspace package). Styles are configured in `example/src/styles/styled.ts`. Components import exclusively from `../styles`, not directly from the package.
