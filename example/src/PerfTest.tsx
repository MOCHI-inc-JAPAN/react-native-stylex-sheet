import { useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Stack } from './components';
import { create, useStylex, vars } from './styles';

const styles = create({
  wrapper: {
    flex: 1,
    backgroundColor: vars.background,
  },
  content: {
    flex: 1,
  },
  box: {
    minHeight: 100,
    backgroundColor: vars.primaryMuted,
    flexCenter: 'row',
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
