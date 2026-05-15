import { Text as RNText, TextProps } from 'react-native';
import { create, useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';
import type { StyleEntry } from '../styles';

const headingStyles = create({
  base: { fontWeight: 'bold', color: 'black' },
  h1: { fontSize: 40, color: 'purple' },
  h2: { fontSize: 24, color: 'green' },
  h3: { fontSize: 20, color: 'blue' },
  h4: { fontSize: 17.6, color: 'red' },
  h5: { fontSize: 16, color: 'black' },
  underlined: { paddingRight: 4, paddingLeft: 4 },
  defaultH1NoUnderline: { marginBottom: 2 },
  underlinedH1: { borderBottomColor: 'purple', borderBottomWidth: 1 },
  underlinedH2: { borderBottomColor: 'green', borderBottomWidth: 1 },
  underlinedH3: { borderBottomColor: 'blue', borderBottomWidth: 1 },
  underlinedH4: { borderBottomColor: 'red', borderBottomWidth: 1 },
  underlinedH5: { borderBottomColor: 'black', borderBottomWidth: 1 },
});

type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export type HeadingProps = TextProps & {
  heading?: HeadingSize;
  underlined?: boolean;
};

const HEADING_STYLES: Record<HeadingSize, StyleEntry> = {
  h1: headingStyles.h1,
  h2: headingStyles.h2,
  h3: headingStyles.h3,
  h4: headingStyles.h4,
  h5: headingStyles.h5,
};

const UNDERLINED_HEADING_STYLES: Record<HeadingSize, StyleEntry> = {
  h1: headingStyles.underlinedH1,
  h2: headingStyles.underlinedH2,
  h3: headingStyles.underlinedH3,
  h4: headingStyles.underlinedH4,
  h5: headingStyles.underlinedH5,
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
        HEADING_STYLES[heading],
        underlined && headingStyles.underlined,
        underlined && UNDERLINED_HEADING_STYLES[heading],
        !underlined && heading === 'h1' && headingStyles.defaultH1NoUnderline
      )}
      {...rest}
    />
  );
}
