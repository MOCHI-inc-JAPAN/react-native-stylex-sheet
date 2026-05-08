# react-native-stylex-sheet

A StyleX-like CSS-in-JS library for React Native. Define styles at module level with `create()`, then apply them with `props()` and `variants()` — no component wrappers required.

## Installation

```sh
npm install react-native-stylex-sheet
# or
yarn add react-native-stylex-sheet
```

## Setup

Call `createStylex()` once with your design tokens and export the returned API:

```ts
// stylex.ts
import { createStylex } from 'react-native-stylex-sheet';

export const stylex = createStylex({
  theme: {
    colors: {
      background: '#fff',
      text: '#000',
      primary: '#6200ee',
    },
    space: {
      1: 4,
      2: 8,
      3: 16,
      4: 32,
    },
    radii: {
      sm: 4,
      md: 8,
      lg: 16,
    },
  },
  media: {
    md: '(width >= 750px)',
    lg: '(width >= 1080px)',
  },
});

export const { create, props, variants, useStylex, theme, createTheme, ThemeProvider, useTheme } = stylex;
```

### `createStylex` config

| Option | Description |
|---|---|
| `theme` | Design token scales: `colors`, `space`, `sizes`, `radii`, `fonts`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacings`, `borderWidths`, `borderStyles`, `zIndices` |
| `media` | Breakpoints as CSS range queries or boolean device-type flags |
| `utils` | Shorthand functions that expand to style objects |
| `themeMap` | Override which CSS properties map to which token scale |

---

## Core API

### `create(styleDefs)`

Define styles at module level (outside components). Each key becomes a `StyleEntry`.

```ts
// button.tsx — module level
import { create } from './stylex';

const styles = create({
  root: {
    paddingHorizontal: '$3',
    paddingVertical: '$2',
    borderRadius: '$md',
    backgroundColor: '$primary',

    variants: {
      size: {
        sm: { paddingHorizontal: '$2', paddingVertical: '$1' },
        lg: { paddingHorizontal: '$4', paddingVertical: '$3' },
      },
      outline: {
        true: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '$primary' },
      },
    },

    compoundVariants: [
      { size: 'lg', outline: 'true', css: { borderWidth: 2 } },
    ],

    defaultVariants: { size: 'sm' },
  },

  label: {
    color: '#fff',
    fontSize: 14,
  },
});
```

Tokens referenced with `$token` are resolved from the active theme. Use `$scale$token` to reference a specific scale explicitly (e.g. `$colors$primary`). Negative values use `$-space$2`.

### `props(styleEntry | variantSpec)`

Resolves a `StyleEntry` (or `VariantSpec`) into `{ style: StyleObject[] }` to spread on any React Native component.

```tsx
import { props } from './stylex';

<View {...props(styles.root)} />
```

`props()` uses the **default theme** and reads device dimensions synchronously (non-reactive). For theme-switching and reactive media queries, use `useStylex().props()` instead.

### `variants(entry, variantProps)`

Wraps a `StyleEntry` with variant prop values. Pass the result to `props()`.

```tsx
import { props, variants } from './stylex';

// Static variant value
<View {...props(variants(styles.root, { size: 'lg' }))} />

// Responsive variant value
<View {...props(variants(styles.root, {
  size: { '@initial': 'sm', '@md': 'lg' },
}))} />
```

### `useStylex()`

A React hook that returns `{ props, variants }` reactive to the current `ThemeProvider` theme and device dimensions (`useWindowDimensions`). Use this inside components whenever you need theme-switching or media-reactive styles.

```tsx
import { useStylex } from './stylex';

function Button({ size, outline }) {
  const sx = useStylex();

  return (
    <Pressable {...sx.props(sx.variants(styles.root, { size, outline }))}>
      <Text {...sx.props(styles.label)}>Press me</Text>
    </Pressable>
  );
}
```

---

## Theming

Themes are managed via React Context. The `ThemeProvider` sets the active theme for all descendant components.

### `createTheme(overrides)`

Creates an alternate theme by overriding token values from the base theme.

```ts
import { createTheme } from './stylex';

const darkTheme = createTheme({
  colors: {
    background: '#000',
    text: '#fff',
    primary: '#bb86fc',
  },
});
```

### `ThemeProvider`

```tsx
import { ThemeProvider } from './stylex';

function App() {
  const [dark, setDark] = useState(false);

  return (
    <ThemeProvider theme={dark ? darkTheme : theme}>
      {/* ... */}
    </ThemeProvider>
  );
}
```

### `useTheme()`

Returns the resolved token values of the active theme. Useful when passing theme values to props that don't accept style objects (e.g. `contentContainerStyle`).

```tsx
import { useTheme } from './stylex';

function Example() {
  const t = useTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: t.space[3] }}>
      {/* ... */}
    </ScrollView>
  );
}
```

### Token aliases

Token values can reference other tokens in the same scale using `$token` syntax:

```ts
createStylex({
  theme: {
    colors: {
      black: '#000',
      primary: '$black' as const,  // alias
    },
  },
});
```

> **Note:** Token alias values require `as const` to get the correct resolved type when accessed via `useTheme()`. Without it TypeScript infers `string`.

---

## Responsive styles

### Dimension-based breakpoints

Media queries follow CSS Level 4 range syntax. Only `width`-based queries are supported.

```ts
createStylex({
  media: {
    md: '(width >= 750px)',
    lg: '(width >= 1080px)',
    xl: '(width >= 1284px)',
  },
});
```

> **Note:** The order of keys in `media` determines priority — later active queries overwrite earlier ones.

Supported range formats:

- `(width > 750px)` / `(width >= 750px)`
- `(width < 1080px)` / `(width <= 1080px)`
- `(750px <= width < 1080px)`

### Device-type flags

Boolean flags let you distinguish device types without dimension checks:

```ts
import DeviceInfo from 'react-native-device-info';

createStylex({
  media: {
    phone: !DeviceInfo.isTablet(),
    tablet: DeviceInfo.isTablet(),
  },
});
```

### Applying responsive variants

```tsx
<View
  {...sx.props(
    sx.variants(styles.root, {
      size: { '@initial': 'sm', '@md': 'md', '@lg': 'lg' },
    })
  )}
/>
```

`@initial` sets the default value when no breakpoint is active.

---

## Utils

Utils are functions that expand to style objects. They can reference other utils and support media keys.

```ts
createStylex({
  utils: {
    shadow: (level: 'sm' | 'md' | 'lg') =>
      ({
        sm: { elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, shadowOpacity: 0.1, shadowColor: '#000' },
        md: { elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, shadowOpacity: 0.2, shadowColor: '#000' },
        lg: { elevation: 10, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.4, shadowColor: '#000' },
      }[level]),
  },
});
```

```ts
const styles = create({
  card: {
    shadow: 'md',
    borderRadius: '$md',
  },
});
```

---

## Supported token scales

| Scale | Properties |
|---|---|
| `colors` | `backgroundColor`, `color`, `borderColor`, `shadowColor`, … |
| `space` | `padding*`, `margin*`, `top`, `right`, `bottom`, `left` |
| `sizes` | `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `flexBasis` |
| `radii` | `borderRadius*` |
| `fonts` | `fontFamily` |
| `fontSizes` | `fontSize` |
| `fontWeights` | `fontWeight` |
| `lineHeights` | `lineHeight` |
| `letterSpacings` | `letterSpacing` |
| `borderWidths` | `borderWidth*` |
| `borderStyles` | `borderStyle` |
| `zIndices` | `zIndex` |

**Not supported:** `shadows` (iOS/Android use different shadow APIs — use a `utils` helper instead) and `transitions` (use the [Animated API](https://reactnative.dev/docs/animated) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)).

**Not applicable to React Native:** global styles, CSS cascade, inheritance, keyframes, pseudo-elements/classes, CSS variables, selectors.
