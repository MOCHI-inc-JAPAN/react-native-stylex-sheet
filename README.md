# react-native-stylex-sheet

A StyleX-like CSS-in-JS library for React Native. Define styles at module level with `create()`, then apply them with `props()` — no component wrappers required.

## Installation

```sh
npm install @mochi-inc-japan/react-native-stylex-sheet
# or
yarn add @mochi-inc-japan/react-native-stylex-sheet
```

## Quick start

```tsx
import { createStylex, defineVars } from '@mochi-inc-japan/react-native-stylex-sheet';

// 1. Define theme variables
const vars = defineVars({ primary: '#6200ee', spacing: 16 });

// 2. Configure a stylex instance with media breakpoints and utilities
const stylex = createStylex({
  media: {
    md: '(width >= 750px)',
    lg: '(width >= 1080px)',
  },
});

// 3. Define styles at module level
const styles = stylex.create({
  button: {
    backgroundColor: vars.primary,
    padding: vars.spacing,
    borderRadius: 8,
  },
  buttonLarge: { padding: 24 },
});

// 4. Apply styles in a component
function Button({ large }: { large?: boolean }) {
  const sx = stylex.useStylex();
  return (
    <Pressable {...sx.props(styles.button, large && styles.buttonLarge)}>
      <Text>Press me</Text>
    </Pressable>
  );
}
```

---

## Setup pattern

Call `createStylex()` once per project and export the returned helpers:

```ts
// src/styles/styled.ts
import { createStylex, defineVars } from '@mochi-inc-japan/react-native-stylex-sheet';

export const vars = defineVars({
  primary: '#6200ee',
  background: '#ffffff',
  text: '#000000',
  space1: 4,
  space2: 8,
  space3: 16,
  radiiMd: 8,
});

export const stylex = createStylex({
  media: {
    md: '(width >= 750px)',
    lg: '(width >= 1080px)',
  },
  utils: {
    size: (value: number) => ({ width: value, height: value }),
  },
});

export const { create, props, useStylex, ThemeProvider, createTheme } = stylex;

// Dark theme — overrides all vars
export const darkTheme = createTheme(vars, {
  primary: '#bb86fc',
  background: '#000000',
  text: '#ffffff',
  space1: 4,
  space2: 8,
  space3: 16,
  radiiMd: 8,
});
```

Components import from this file, not directly from the package:

```tsx
import { create, useStylex, vars } from '../styles/styled';
```

---

## API reference

### `createStylex(config)`

Creates a configured stylex instance. Call once at the application level.

```ts
const stylex = createStylex({
  media?: Record<string, string | boolean>,
  utils?: Record<string, (value: any) => StyleObject>,
});
```

Returns `{ create, props, useStylex, defineVars, defineConsts, createTheme, ThemeProvider, media, utils }`.

---

### `defineVars(defaults)`

Defines a group of theme variables. Returns `ThemeToken` objects that can be used as style values in `create()`. Call at module level.

```ts
const vars = defineVars({
  primary: '#6200ee',
  spacing: 16,
  radius: 8,
});
```

Token values are resolved at render time:
- Without a `ThemeProvider`, the default values in `defineVars` are used.
- Inside a `ThemeProvider`, the overrides from `createTheme` are applied.

---

### `defineConsts(consts)`

Defines non-overridable constants. Returns a frozen copy. Use when you need module-level constants without token indirection.

```ts
const consts = defineConsts({
  maxWidth: 1200,
  hitSlop: 8,
});
```

---

### `create(styleDefs)`

Defines styles at module level. Returns a map of `StyleEntry` handles.

```ts
const styles = create({
  container: {
    backgroundColor: vars.background,
    padding: vars.spacing,
  },
  title: {
    color: vars.text,
    fontSize: 24,
    fontWeight: '700',
  },
});
```

Style values can be:
- Plain React Native values (`number`, `string`)
- `ThemeToken` objects from `defineVars()`
- Util invocations (keys matching the configured `utils`)
- Media-nested style objects (keys prefixed with `@`)

#### Variants

Each style definition can include `variants`, `compoundVariants`, and `defaultVariants`:

```ts
const styles = create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',

    variants: {
      color: {
        primary: { backgroundColor: vars.primary },
        secondary: { backgroundColor: vars.secondary },
      },
      size: {
        sm: { height: 32, paddingHorizontal: 12 },
        lg: { height: 48, paddingHorizontal: 24 },
      },
    },

    compoundVariants: [
      // Applied when color=primary AND size=lg simultaneously
      { color: 'primary', size: 'lg', css: { borderWidth: 2 } },
    ],

    defaultVariants: { color: 'primary', size: 'sm' },
  },
});
```

`defaultVariants` are applied automatically. To activate a non-default variant, pass the corresponding `StyleEntry` conditionally to `props()`.

---

### `props(...styleEntries)`

Resolves style entries into `{ style: StyleProp[] }` to spread on any React Native component. Falsy values (`null`, `false`, `undefined`) are silently skipped.

```tsx
// Module-level usage (non-reactive)
<View {...props(styles.container, isHighlighted && styles.highlighted)} />
```

- Uses default token values (ignores any active `ThemeProvider`)
- Reads device dimensions synchronously — **not reactive** to dimension changes
- Suitable for static styles that never change

For theme-switching or media-reactive behaviour, use `useStylex().props()` instead.

---

### `useStylex()`

A React hook returning `{ props }` that is reactive to the current `ThemeProvider` theme and `useWindowDimensions()`. Use this inside components.

```tsx
function Card({ highlighted }: { highlighted: boolean }) {
  const sx = useStylex();
  return (
    <View {...sx.props(styles.card, highlighted && styles.cardHighlighted)}>
      <Text {...sx.props(styles.title)}>Hello</Text>
    </View>
  );
}
```

---

### Variant pattern

Since `props()` / `useStylex().props()` accept any number of `StyleEntry` arguments, the recommended pattern for dynamic variants is to define separate style entries and pass them conditionally:

```tsx
const buttonStyles = create({
  base:            { borderRadius: 8, justifyContent: 'center' },
  variantPrimary:  { backgroundColor: vars.primary },
  variantDanger:   { backgroundColor: vars.error },
  sizeSm:          { height: 32, paddingHorizontal: 12 },
  sizeLg:          { height: 48, paddingHorizontal: 24 },
});

type Variant = 'primary' | 'danger';
const VARIANT_ENTRY: Record<Variant, StyleEntry> = {
  primary: buttonStyles.variantPrimary,
  danger:  buttonStyles.variantDanger,
};

function Button({ variant = 'primary', size = 'sm' }: Props) {
  const sx = useStylex();
  return (
    <Pressable
      {...sx.props(
        buttonStyles.base,
        VARIANT_ENTRY[variant],
        size === 'sm' && buttonStyles.sizeSm,
        size === 'lg' && buttonStyles.sizeLg,
      )}
    />
  );
}
```

---

### Theming

#### `createTheme(vars, overrides)`

Creates a `ThemeOverride` from a `VarsGroup`. All keys from `vars` must be present in `overrides`.

```ts
const darkTheme = createTheme(vars, {
  primary: '#bb86fc',
  background: '#000000',
  text: '#ffffff',
  // … all other keys required
});
```

#### `ThemeProvider`

Provides a `ThemeOverride` to all descendant components using `useStylex()`. Without a provider (or with `theme={null}`), default token values are used.

```tsx
function App() {
  const [dark, setDark] = useState(false);
  return (
    <ThemeProvider theme={dark ? darkTheme : null}>
      <Screen />
    </ThemeProvider>
  );
}
```

---

### Media queries

Configure breakpoints in `createStylex()`:

```ts
const stylex = createStylex({
  media: {
    // CSS Level 4 range queries (width-based only)
    md:  '(width >= 750px)',
    lg:  '(width >= 1080px)',
    xl:  '(width >= 1284px)',
    // Boolean device-type flags
    phone:  true,
    tablet: false,
  },
});
```

**Key ordering matters:** later active queries overwrite earlier ones — put more specific queries last.

Supported range formats:

| Format | Example |
|---|---|
| Single lower bound | `(width >= 750px)` / `(width > 750px)` |
| Single upper bound | `(width <= 1080px)` / `(width < 1080px)` |
| Range | `(750px <= width < 1080px)` |

#### Applying media styles

Nest responsive styles under `@<mediaKey>` inside a style definition:

```ts
const styles = create({
  text: {
    fontSize: 16,
    '@md': { fontSize: 18 },
    '@lg': { fontSize: 20 },
  },
});
```

#### Responsive variants

Pass a responsive object as a variant selector when calling `props()` / `useStylex().props()`:

```tsx
const styles = create({
  base: { color: 'black' },
  sizeSmall:  { fontSize: 14 },
  sizeMedium: { fontSize: 18 },
  sizeLarge:  { fontSize: 24 },
});

function ResponsiveText() {
  const sx = useStylex();
  // Non-reactive, dimension-based switching via defaultVariants in create()
  // is automatic. For reactive switching, use conditional props:
  return <Text {...sx.props(styles.base, styles.sizeMedium)} />;
}
```

---

### Utils

Utils are shorthand functions that expand to style objects. They can reference other utils and use media keys.

```ts
const stylex = createStylex({
  utils: {
    // Simple shorthand
    size: (value: number) => ({ width: value, height: value }),

    // Can reference other utils
    square: (value: number) => ({
      size: value,
      borderRadius: value / 2,
    }),

    // Can include media keys
    shadow: (level: 'sm' | 'md' | 'lg') =>
      ({
        sm: { elevation: 2, shadowRadius: 3,  shadowOpacity: 0.1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 } },
        md: { elevation: 5, shadowRadius: 6,  shadowOpacity: 0.2, shadowColor: '#000', shadowOffset: { width: 0, height: 3 } },
        lg: { elevation: 10, shadowRadius: 12, shadowOpacity: 0.4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 } },
      })[level],
  },
});

const styles = create({
  card: {
    size: 100,        // expands to { width: 100, height: 100 }
    shadow: 'md',     // expands to the shadow object
    borderRadius: 8,
  },
});
```

---

## TypeScript

The library is fully typed. Key types exported from the package:

```ts
import type {
  StyleEntry,   // handle returned by create()
  StyleItem,    // StyleEntry | null | false | undefined (accepted by props())
  ThemeToken,   // opaque token from defineVars()
  VarsGroup,    // map of ThemeTokens returned by defineVars()
  ThemeOverride, // result of createTheme()
} from '@mochi-inc-japan/react-native-stylex-sheet';
```

`StyleEntry` can be stored in typed maps for variant dispatch:

```ts
import type { StyleEntry } from '../styles';

const VARIANT_STYLES: Record<'primary' | 'secondary', StyleEntry> = {
  primary:   styles.variantPrimary,
  secondary: styles.variantSecondary,
};
```

---

## Limitations

React Native has no CSS cascade, inheritance, keyframes, pseudo-elements, or global styles — these features are absent by design.

| Not supported | Reason / alternative |
|---|---|
| CSS variables | Use `defineVars()` + `ThemeProvider` |
| `shadows` token scale | iOS/Android have incompatible shadow APIs — use a `utils` helper |
| `transitions` | Use [Animated API](https://reactnative.dev/docs/animated) or [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) |
| Global styles | Not applicable to React Native |
| Pseudo-classes / elements | Not applicable to React Native |
