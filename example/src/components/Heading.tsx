import { Text as RNText, TextProps } from 'react-native';
import { create, useStylex, createVariants, type Variants, defineVars } from '@mochi-inc-japan/react-native-stylex-sheet';
import { themes } from '../styles';

const defaultColors = defineVars({ h1: 'purple', h2: 'green', h3: 'blue', h4: 'red', h5: 'black' })

const headingVariants = createVariants({
  heading: {
    fontSize: { h1: 40, h2: 24, h3: 20, h4: 17.6, h5: 16 },
    color: defaultColors,
    borderBottomColor: defaultColors,
  },
  underlinedHeading: {
    borderBottomWidth: { true: 1},
  },
});

const darkHeadingVariants = createVariants({
  heading: { color: { ...defaultColors, h5: 'white' }, borderBottomColor: { ...defaultColors, h5: 'white' }, },
})

const themeOverrides = create({
  [themes.dark]: {...darkHeadingVariants.heading}
})

const headingStyles = create({
  base: { fontWeight: 'bold', color: 'black' },
  heading: {
    ...headingVariants.heading,
    ...headingVariants.underlinedHeading,
  },
  underlined: { paddingRight: 4, paddingLeft: 4 },
  defaultH1NoUnderline: { marginBottom: 2 },
});

type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export type HeadingProps = TextProps & {
  heading?: HeadingSize;
  underlined?: boolean;
};

export function Heading({
  heading = 'h1',
  underlined = false,
  ...rest
}: HeadingProps) {
  const sx = useStylex();
  return (
    <RNText
      accessibilityRole="text"
      {...sx.props(
        headingStyles.base,
        sx.mix<Variants<typeof headingVariants>>(headingStyles.heading, {
          heading,
          underlinedHeading: underlined
        }),
        sx.mix<Variants<typeof darkHeadingVariants>>(themeOverrides[sx.theme], {heading})
      )}
      {...rest}
    />
  );
}
