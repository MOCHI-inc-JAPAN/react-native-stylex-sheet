import { render } from '@testing-library/react-native';

const aspectRatio = 19.5 / 9; // iPhone 14

export function mockDimensions({
  width = 750,
  height = width * aspectRatio,
  pixelRatio = 1,
}: {
  width?: number;
  height?: number;
  pixelRatio?: number;
}) {
  jest.resetModules();
  jest.doMock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({ width, height }),
  }));
  // The react-native index.js exports PixelRatio via a lazy getter:
  //   get PixelRatio() { return require('./Libraries/Utilities/PixelRatio').default }
  // so the mock must be wrapped under `default`.
  jest.doMock('react-native/Libraries/Utilities/PixelRatio', () => ({
    __esModule: true,
    default: {
      get: () => pixelRatio,
      getFontScale: () => 1,
      getPixelSizeForLayoutSize: (layoutSize: number) =>
        layoutSize * pixelRatio,
      roundToNearestPixel: (layoutSize: number) =>
        Math.round(layoutSize * pixelRatio) / pixelRatio,
    },
  }));
  jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
    __esModule: true,
    default: {
      get: jest.fn().mockReturnValue({ width, height }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  }));
}

export function reduceStyles(s: any) {
  return s.reduce((s1: any, s2: any) => ({ ...s1, ...s2 }), {});
}

export function finalStyle(Component: React.ReactElement) {
  return reduceStyles(
    render(
      Component
    ).toJSON()?.props.style
  );
}
