import { View } from 'react-native';
import { create, props } from '@mochi-inc-japan/react-native-stylex-sheet';

const styles = create({
  box: { backgroundColor: 'red', width: 100, height: 100 },
  highlighted: { backgroundColor: 'yellow' },
});

export const Test = <View {...props(styles.box, styles.highlighted)} />;
