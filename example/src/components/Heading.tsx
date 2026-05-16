import { Text as RNText, TextProps } from 'react-native';
import { create, useStylex, createVariants, type Variants } from '@mochi-inc-japan/react-native-stylex-sheet';

const headingVariants = createVariants({
  heading: {
    fontSize: { h1: 40, h2: 24, h3: 20, h4: 17.6, h5: 16 },
    color: { h1: 'purple', h2: 'green', h3: 'blue', h4: 'red', h5: 'black' },
  },
  underlinedHeading: {
    borderBottomColor: { h1: 'purple', h2: 'green', h3: 'blue', h4: 'red', h5: 'black' },
    borderBottomWidth: { h1: 1, h2: 1, h3: 1, h4: 1, h5: 1 },
  },
});

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
          underlinedHeading: underlined ? heading : undefined,
        }),
        underlined && headingStyles.underlined,
        !underlined && heading === 'h1' && headingStyles.defaultH1NoUnderline
      )}
      {...rest}
    />
  );
}
