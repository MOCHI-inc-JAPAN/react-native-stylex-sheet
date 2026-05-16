import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react';

import { RNStyleXProvider } from '@mochi-inc-japan/react-native-stylex-sheet';
import { themes } from '../styles';

type ColorMode = keyof typeof themes;

type ContextValue = {
  colorMode: ColorMode;
  setColorMode: (t: ColorMode) => void;
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<undefined | ContextValue>(undefined);

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const theme = colorMode === 'dark' ? 'dark' : 'light';
  const toggleColorMode = useCallback(() => {
    setColorMode((p) => (p === 'dark' ? 'light' : 'dark'));
  }, []);
  return (
    <ColorModeContext.Provider
      value={{ colorMode, setColorMode, toggleColorMode }}
    >
      <RNStyleXProvider theme={themes[theme]}>
        {children}
      </RNStyleXProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error('Missing ColorModeProvider!');
  return context;
};
