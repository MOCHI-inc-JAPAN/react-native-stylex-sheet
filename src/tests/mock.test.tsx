import React from 'react';
import { View } from 'react-native';

import { mockDimensions, finalStyle } from './test-utils';

jest.mock('../utils/media', () => {
  const originalModule = jest.requireActual('../utils/media');

  return {
    ...originalModule,
    media: jest.fn(originalModule.media),
  };
});

it('preset media effectively key access', async () => {
  const mediaUtils = await import( '../utils/media');
  const stylex = await import( '../');

  const mocked = jest.mocked(mediaUtils.media);

  const mediaVal = stylex.defineConsts({
    md: '(width >= 750px)',
    lg: '(width >= 1080px)',
  });

  const styles = stylex.create({
    view: {
      backgroundColor: {
        default: 'yellow',
        [mediaVal.md]: 'blue',
        [mediaVal.lg]: 'green',
      },
      width: {
        default: 100,
        [mediaVal.md]: 200,
        [mediaVal.lg]: 300,
      },
    },
  });

  mockDimensions({ width: 750 });

  function Comp() {
    const sx = stylex.useStylex();
    return <View {...sx.props(styles.view)} />;
  }

  expect(
    finalStyle(
      <stylex.RNStyleXProvider media={mediaVal}>
        <Comp />
      </stylex.RNStyleXProvider>
    )
  ).toMatchObject({
    backgroundColor: 'blue',
    width: 200,
  });

  expect(jest.isMockFunction(mocked)).toBe(true);
  expect(mocked.mock.calls[0][1]).toBe(mediaVal.md);
});
