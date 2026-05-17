# react-native-stylex-sheet

A lightweight, fast CSS-in-JS library for React Native. It maintains backward compatibility with React Native's standard `StyleSheet` CSS syntax while adding extensions such as themes and variants that are not natively supported. The goal is to provide an interface as compatible as possible with [stylexjs](https://stylexjs.com/docs/learn/recipes/variants/) on the web, simplifying cross-platform development. Because only React Native and React are peer dependencies, components built with this library can run as-is on react-native-web, as long as they don't include code that depends on native APIs or device-specific behavior.

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

For dynamic styles, pass a style object directly to `props()`:

```tsx
import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet';

const styles = stylex.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
});

function Button({ width }) {
  return (
    <Pressable {...stylex.props(styles.button, { width })}>
      <Text>Press me</Text>
    </Pressable>
  );
}
```

### Advanced usage (theme / variants / media)

When using theming, variants, or responsive breakpoints, wrap the app in `RNStyleXProvider` and use `const stylex = useStylex()` inside components.

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
        stylex.mix<Variants<typeof buttonVariants>>(styles.button, {
          color: danger ? 'danger' : 'default',
        })
      )}
    >
      <Text>Press me</Text>
    </Pressable>
  );
}
```

When using `useStylex()` with `RNStyleXProvider`, the provider's theme and media are applied automatically, so `mix()` can be omitted when no variants are needed. You can also explicitly override `width` or `theme` at the call site. Because the standalone `mix` function exported from the library cannot omit these, it is recommended to use the `mix` from `useStylex()` for any component that needs theme, variants, or media.

```tsx
// const stylex = useStylex();
// or
// import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet'
stylex.mix<Variants<typeof buttonVariants>>(
  [
    styles.button,
    {
      media: stylex.windowWidth,
      theme: themes.dark,
    },
  ],
  { color: danger ? 'danger' : 'default' }
);
```

---

## Migrating from existing React Native components

`stylex.create` maintains backward compatibility with React Native's standard `StyleSheet.create` as long as the extended syntax is not used, so existing React Native styles can be reused as-is. This means you don't need to migrate all components at once — you can replace them incrementally.

```tsx
// Before
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
});

function Button() {
  return (
    <Pressable>
      <Text>Press me</Text>
    </Pressable>
  );
}

// After
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

## Setup pattern

It is recommended to define shared constants (media breakpoints and themes) in a single file and export them:

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

export const fontSize = defineConsts({
  default: 16,
  md: 24,
  lg: 32,
});

export const { themes } = createThemes(['light', 'dark']);
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
      danger: '#b00020',
    },
    borderColor: {
      default: 'transparent',
      danger: '#b00020',
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

Use the `Variants` type helper to infer the values accepted by `mix()` for a given variant:

```ts
import type { Variants } from '@mochi-inc-japan/react-native-stylex-sheet';

type ButtonVariants = Variants<typeof buttonVariants>;
// { color: 'primary' | 'danger' | 'default'; size: 'sm' | 'lg' | 'default' }

stylex.mix<Variants<ButtonVariants>>(styles.button, { color, size });
```

---

### `createThemes(themeNames)`

Activate a theme by passing its key to `RNStyleXProvider`:

```tsx
<RNStyleXProvider theme={themes.dark}>
  <App />
</RNStyleXProvider>
```

Creates named theme keys. Returns `{ themes }` where each name maps to an opaque key string used as a style property key in `create()`.

```tsx
import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet';
import { useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';

const { themes } = stylex.createThemes(['light', 'dark']);

const styles = stylex.create({
  text: {
    color: {
      default: '#000',
      [themes.light]: '#000',
      [themes.dark]: '#fff',
    },
  },
});

function App() {
  const stylex = useStylex();
  return <Text {...stylex.props(styles.text)}>Hello World!</Text>;
}
```

When you need to add styles or set different variables per theme, use `stylex.create` and `stylex.props` to override the default style with the style corresponding to the active theme:

```tsx
import { View, Text } from 'react-native';
import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet';
import { useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';

const { themes } = stylex.createThemes(['light', 'dark', 'other']);

// Default style definitions
const defaultColors = stylex.defineVars({
  primary: 'black',
  danger: 'red',
});

const variables = stylex.createVariants({
  text: {
    color: defaultColors,
  },
});

const styles = stylex.create({
  view: {
    width: '100%',
    height: '100%',
  },
  text: {
    ...variables.text,
  },
});

// Variant style definitions for additional themes
const darkThemeStyleVariants = stylex.createVariants({
  text: { color: { ...defaultColors, primary: 'white' } },
});

const otherThemeStyleVariants = stylex.createVariants({
  text: { color: { ...defaultColors, primary: 'blue' } },
});

const viewTheme = stylex.create({
  // Additional styles written directly into create
  [themes.dark]: { backgroundColor: 'black' },
  [themes.other]: { backgroundColor: 'gray' },
});

const textTheme = stylex.create({
  [themes.dark]: {
    borderColor: 'white',
    borderWidth: 1,
    ...darkThemeStyleVariants.text,
  },
  [themes.other]: { ...otherThemeStyleVariants.text },
});

function App() {
  const stylex = useStylex();
  return (
    <View {...stylex.props(styles.view, viewTheme[stylex.theme])}>
      <Text
        {...stylex.props(
          styles.text,
          stylex.mix(textTheme[stylex.theme], { text: 'primary' })
        )}
      >
        Hello World!
      </Text>
    </View>
  );
}
```

---

### `RNStyleXProvider`

Provider component that supplies `theme` and `windowWidth` (the basis for media query evaluation) to all `useStylex()` calls below it. If `windowWidth` is not specified, the provider implicitly uses `PixelRatio.getPixelSizeForLayoutSize(useWindowDimensions().width)`.

```tsx
<RNStyleXProvider theme={themes.dark}>
  <Screen />
</RNStyleXProvider>
```

Props:

- `theme` — a theme key string from `createThemes()`, or omit for no active theme
- `windowWidth` — override device width (defaults to `PixelRatio.getPixelSizeForLayoutSize(useWindowDimensions().width)`)

---

### `useStylex()`

Hook returning `{ props, mix, windowWidth, theme }`. Must be used inside `RNStyleXProvider`. `mix` automatically applies the active theme and screen width from context. It can be omitted when no variants are specified, and explicit `width` or `theme` overrides are also supported at the call site.

```tsx
import * as stylex from '@mochi-inc-japan/react-native-stylex-sheet';

const { themes } = stylex.createThemes(['light', 'dark']);
const colors = stylex.defineVars({
  default: '#6200ee',
  primary: '#6200ee',
  danger: '#b00020',
});
const cardVariants = stylex.createVariants({
  // variant group name: 'bgcolor'
  bgcolor: {
    backgroundColor: colors,
  },
});
const styles = stylex.create({
  card: {
    ...cardVariants,
  },
  title: {
    color: {
      [themes.light]: 'black',
      [themes.dark]: 'white',
    },
    padding: {
      default: 12,
      [media.md]: 16,
    },
    borderRadius: 8,
  },
});

function Card({ bgcolor }: { bgcolor: keyof typeof colors }) {
  const stylex = useStylex();
  return (
    <View
      {...stylex.props(
        stylex.mix<Variants<typeof cardVariants>>(styles.card, { bgcolor })
      )}
    >
      {/* theme and media styles for styles.title are applied even without calling stylex.mix */}
      <Text {...stylex.props(styles.title)}>Hello</Text>
    </View>
  );
}

render(
  <stylex.RNStylexProvider theme={themes.dark}>
    <Card bgcolor="primary" />
  </stylex.RNStylexProvider>
);
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

const media = defineConsts({
  md: '(width >= 750px)',
  lg: '(width >= 1080px)',
});

const style = stylex.mix(
  [
    styles.button,
    {
      media: media.md, // force a specific media match (or pass a numeric width)
      theme: themes.dark, // force a specific theme key
    },
  ],
  { color: 'danger' }
);
```

---

### `props(...args)`

Collects style arrays into `{ style: [...] }` to spread on a React Native component. Accepts `RNStyle[]` arrays or plain style objects.

```tsx
// Combine multiple mix() results
function Component() {
  const stylex = useStylex();
  return (
    <View
      {...stylex.props(stylex.mix(styles.base), stylex.mix(styles.override))}
    />
  );
}

// Module-level (non-reactive, default styles only) — import * as stylex
<View {...stylex.props(styles.container)} />;
```

---

## Media queries

Media query strings are used directly as style property keys. The string must match one of the supported range formats:

| Format      | Example                                  |
| ----------- | ---------------------------------------- |
| Lower bound | `(width >= 750px)` / `(width > 750px)`   |
| Upper bound | `(width <= 1080px)` / `(width < 1080px)` |
| Range       | `(750px <= width < 1080px)`              |

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

## Limitations

Sometimes, you encounter components, which deny array style value like TouchableOpacity or have special style key like "containerStyle" of ScrollView.
There are two solutions.

1. Use "default" key of `stylex.create` result properties when the style has no theme and media query and variant. The value of it is RNStyle Object to which is not applied any overwritten by them.

```tsx
const styles = stylex.create({
  scroll: {
    width: 100
  }
})

<ViewScroll contentContainerStyle={styles.scroll.default}>
```

2. Use `stylex.flatten()` with `stylex.mix()` when you want to merge all to overwrite default styles.

```tsx
const styles = stylex.create({
  touch: {
    width: 100
    ...styles.createVariants({
      h: {
        height: {
          md: 100,
          lg: 200
        }
      }
    })
  }
})

const stylex = useStylex()
<TouchableOpacity style={stylex.flatten(stylex.mix(styles.touch, {h: 'mg'}))} >
```

React Native has no CSS cascade, inheritance, keyframes, pseudo-elements, or global styles — these features are absent by design.

| Not supported             | Alternative                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS variables             | Use `defineVars()` / `defineConsts()` for shared values                                                                                             |
| `shadows` token scale     | iOS/Android have incompatible shadow APIs — define shadow styles directly                                                                           |
| `transitions`             | Use [Animated API](https://reactnative.dev/docs/animated) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) |
| Global styles             | Not applicable to React Native                                                                                                                      |
| Pseudo-classes / elements | Not applicable to React Native                                                                                                                      |
