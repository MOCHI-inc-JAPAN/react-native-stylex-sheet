import { useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Stack } from './components';
import { create, useStylex } from '@mochi-inc-japan/react-native-stylex-sheet';
import { vars, themes } from './styles';

const styles = create({
  wrapper: {
    flex: 1,
    backgroundColor: { default: vars.background, [themes.dark]: '#000000' },
  },
  content: {
    flex: 1,
  },
  box: {
    minHeight: 100,
    backgroundColor: vars.primaryMuted,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: vars.radiiMd,
  },
  boxText: {
    color: vars.primaryText,
  },
});

let measured = false;

export default function PerfTest() {
  const start = useMemo(() => new Date(), []);
  const sx = useStylex();

  return (
    <SafeAreaView
      {...sx.props(styles.wrapper)}
      onLayout={() => {
        if (!measured) {
          measured = true;
          console.log(
            `Time taken: ${new Date().getTime() - start.getTime()} ms`
          );
        }
      }}
    >
      <ScrollView
        {...sx.props(styles.content)}
        contentContainerStyle={{ padding: 8 }}
      >
        <Stack axis="y" space="4">
          {Array.from({ length: 1000 }).map((_, i) => (
            <View key={i} {...sx.props(styles.box)}>
              <Text {...sx.props(styles.boxText)}>{i + 1}</Text>
            </View>
          ))}
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
