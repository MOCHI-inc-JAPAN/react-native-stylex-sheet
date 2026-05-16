# react-native-stylex-sheet

A StyleX-inspired CSS-in-JS library for React Native. Define styles at module level with `create()`, then apply them reactively with `useStylex().mix()` and `props()`.

## Installation

```sh
npm install @mochi-inc-japan/react-native-stylex-sheet
```

## Quick start

### Simple usage (no theme / variants / media)

When you don't need theming, variants, or responsive media queries, use the namespace import:

```tsx
import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet';

const styles = stylex.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
});

function Button() {
  return (
    <Pressable {...stylex.props(styles.button)}>
      <Text>Press me</Text>
    </Pressable>
  );
}
```

### Advanced usage (theme / variants / media)

When using theming, variants, or responsive breakpoints, wrap the app in `RNStyleXProvider` and use `const stylex = useStylex()` inside components. Theme and media are then applied automatically — only variant selections need to be passed to `mix()`.

```tsx
import {
  create,
  createVariants,
  createThemes,
  defineConsts,
  useStylex,
  RNStyleXProvider,
} from '@mochi-inc-japan/react-native-stylex-sheet';
import type { Variants } from '@mochi-inc-japan/react-native-stylex-sheet';

// 1. Define media breakpoints as constants
const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
});

// 2. Define themes
const { themes } = createThemes(['light', 'dark']);

// 3. Define variant groups (optional)
const buttonVariants = createVariants({
  color: {
    backgroundColor: {
      default: '#6200ee',
      danger: '#b00020',
    },
  },
});

// 4. Define styles at module level
const styles = create({
  button: {
    ...buttonVariants.color,
    padding: {
      default: 12,
      [media.md]: 16,
    },
    borderRadius: 8,
  },
});

// 5. Wrap your app in RNStyleXProvider
function App() {
  const [dark, setDark] = useState(false);
  return (
    <RNStyleXProvider theme={dark ? themes.dark : undefined}>
      <Screen />
    </RNStyleXProvider>
  );
}

// 6. Use const stylex = useStylex() inside components
// — theme and media from RNStyleXProvider are applied automatically in mix()
function Button({ danger }: { danger?: boolean }) {
  const stylex = useStylex();
  return (
    <Pressable
      {...stylex.props(
        stylex.mix<Variants<typeof buttonVariants>>(styles.button, { color: danger ? 'danger' : 'default' })
      )}
    >
      <Text>Press me</Text>
    </Pressable>
  );
}
```

---

## Core concepts

Styles in this library are **variant-keyed objects**. A style property value can be a plain value or an object whose keys select which value applies:

| Key form | Meaning |
|---|---|
| `default` | Fallback value — always applied first |
| `'(width >= 750px)'` (a media string) | Applied when the screen width matches |
| `themes.dark` (a theme key) | Applied when that theme is active |
| `@color_danger` (from `createVariants`) | Applied when that variant is selected |

`mix()` resolves the active key(s) and returns the matching style objects. `props()` just returns the `default` style.

---

## Setup pattern

Define shared constants (media breakpoints and themes) in a single file and export them:

```ts
// src/styles/stylex.ts
import {
  createThemes,
  defineConsts,
} from '@mochi-inc-japan/react-native-stylex-sheet';

export const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
});

export const { themes } = createThemes(['light', 'dark']);
```

Components import shared constants from this file, and other functions directly from the package:

```tsx
import { create, useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';
import { media, themes } from '../styles/stylex';
```

---

## API reference

### `defineConsts(consts)`

Returns a frozen copy of the given object. Use for module-level constants such as media query strings or other shared values.

```ts
const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
});
```

### `defineVars(defaults)`

Alias for `defineConsts`. Returns a frozen copy. Useful for defining default values that are referenced as style property objects.

```ts
const colors = defineVars({
  default: 'white',
  primary: 'red',
  secondary: 'blue',
});

const styles = create({
  box: { backgroundColor: colors }, // 'white' by default
});
```

---

### `create(styleDefs)`

Defines styles at module level. Each property value can be a plain React Native value or an object mapping variant keys to values. Returns a map of compiled style entries.

```ts
const styles = create({
  container: {
    backgroundColor: {
      default: '#fff',
      [media.md]: '#f0f0f0',
      [themes.dark]: '#111',
    },
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
```

---

### `createVariants(variantDefs)`

Defines named variant groups. Each group maps CSS property names to objects with `default` and named variant values. Returns processed variant objects that can be spread into `create()`.

```ts
const buttonVariants = createVariants({
  // variant group name: 'color'
  color: {
    backgroundColor: {
      default: '#6200ee',
      primary: '#6200ee',
      danger:  '#b00020',
    },
    borderColor: {
      default: 'transparent',
      danger:  '#b00020',
    },
  },
  size: {
    height: {
      default: 40,
      sm: 32,
      lg: 48,
    },
  },
});

const styles = create({
  button: {
    ...buttonVariants.color, // spread all color-variant properties
    ...buttonVariants.size,
    borderRadius: 8,
  },
});
```

To type the variant selection map use the `Variants` helper:

```ts
import type { Variants } from '@mochi-inc-japan/react-native-stylex-sheet';

type ButtonVariants = Variants<typeof buttonVariants>;
// { color: 'primary' | 'danger' | 'default'; size: 'sm' | 'lg' | 'default' }
```

---

### `createThemes(themeNames)`

Creates named theme keys. Returns `{ themes }` where each name maps to an opaque key string used as a style property key in `create()`.

```ts
const { themes } = createThemes(['light', 'dark']);

const styles = create({
  text: {
    color: {
      default: '#000',
      [themes.light]: '#000',
      [themes.dark]:  '#fff',
    },
  },
});
```

Activate a theme by passing its key to `RNStyleXProvider`:

```tsx
<RNStyleXProvider theme={themes.dark}>
  <App />
</RNStyleXProvider>
```

---

### `RNStyleXProvider`

Provider component that supplies the current `theme` and reactive `width` to all descendant `useStylex()` calls. Must wrap any component that calls `useStylex()`.

```tsx
<RNStyleXProvider theme={themes.dark}>
  <Screen />
</RNStyleXProvider>
```

Props:
- `theme` — a theme key string from `createThemes()`, or omit for no active theme
- `width` — override device width (defaults to `PixelRatio.getPixelSizeForLayoutSize(useWindowDimensions().width)`)

---

### `useStylex()`

Hook returning `{ props, mix, width, theme }`. Must be used inside `RNStyleXProvider`. `mix` automatically applies the active theme and screen width from context — only variant selections need to be passed explicitly.

```tsx
function Card({ danger }: { danger: boolean }) {
  const stylex = useStylex();
  return (
    <View {...stylex.props(
      stylex.mix<Variants<typeof cardVariants>>(styles.card, { color: danger ? 'danger' : 'default' })
    )}>
      <Text {...stylex.props(stylex.mix(styles.title))}>Hello</Text>
    </View>
  );
}
```

---

### `mix(target, variantArgs?)`

Resolves a compiled style entry into an array of `RNStyle` objects:

1. Always includes the `default` style.
2. If `variantArgs` is provided, appends the matching variant styles.
3. When called via `useStylex().mix()`, also applies the active theme and media query styles automatically.

```ts
// Module-level (non-reactive) — only default styles
const style = mix(styles.button);

// With explicit variants
const style = mix(styles.button, { color: 'danger', size: 'lg' });

// Inside component — theme + media from RNStyleXProvider are applied automatically
const stylex = useStylex();
const style = stylex.mix(styles.button, { color: 'danger' });
```

---

### `props(...args)`

Collects style arrays into `{ style: [...] }` to spread on a React Native component. Accepts compiled style entries, `RNStyle[]` arrays, or plain style objects.

```tsx
// Combine multiple mix() results
function Component() {
  const stylex = useStylex();
  return <View {...stylex.props(stylex.mix(styles.base), stylex.mix(styles.override))} />;
}

// Module-level (non-reactive, default styles only) — import * as stylex
<View {...stylex.props(styles.container)} />
```

---

## Media queries

Media query strings are used directly as style property keys. The string must match one of the supported range formats:

| Format | Example |
|---|---|
| Lower bound | `(width >= 750px)` / `(width > 750px)` |
| Upper bound | `(width <= 1080px)` / `(width < 1080px)` |
| Range | `(750px <= width < 1080px)` |

**Key ordering matters:** later matching keys overwrite earlier ones, so put more specific queries last.

```ts
const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)', // more specific — put last
});

const styles = create({
  text: {
    fontSize: {
      default: 16,
      [media.md]: 18,
      [media.lg]: 20, // wins over md when lg also matches
    },
  },
});
```

---

## TypeScript

Key types exported from the package:

```ts
import type {
  Variants,     // maps variant group names to their allowed values
  XRNStyle,     // style object where values can be variant-keyed objects
  RNStyle,      // plain React Native style object
  XRNStyleSheets, // return type of create()
} from '@mochi-inc-japan/react-native-stylex-sheet';
```

Typed variant dispatch:

```ts
import type { Variants } from '@mochi-inc-japan/react-native-stylex-sheet';

type ButtonVariants = Variants<typeof buttonVariants>;

function Button({ color }: { color: ButtonVariants['color'] }) {
  const stylex = useStylex();
  return <Pressable {...stylex.props(stylex.mix<ButtonVariants>(styles.button, { color }))} />;
}
```

---

## Limitations

React Native has no CSS cascade, inheritance, keyframes, pseudo-elements, or global styles — these features are absent by design.

| Not supported | Alternative |
|---|---|
| CSS variables | Use `defineVars()` / `defineConsts()` for shared values |
| `shadows` token scale | iOS/Android have incompatible shadow APIs — define shadow styles directly |
| `transitions` | Use [Animated API](https://reactnative.dev/docs/animated) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) |
| Global styles | Not applicable to React Native |
| Pseudo-classes / elements | Not applicable to React Native |
