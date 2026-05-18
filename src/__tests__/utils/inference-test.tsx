import { Text, TextStyle } from 'react-native';
import * as stylex from '../../';
import { useStylex } from '../../';
import { Children, createElement } from 'react';

const styles = stylex.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 48,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  features: {
    gap: 20,
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2D6A4F',
  },
  secondaryButtonText: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '600',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 12,
    color: '#888',
  },
});

console.log(styles.featureIcon['default']);

const { themes, defineThemes, themeStyleSheets } = stylex.createThemes(['light', 'dark']);

const font = stylex.defineVars({
  size: 12,
});

const themeStyle = defineThemes<TextStyle>({
  [themes.light]: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: font.size,
  },
});

const themeStyles = themeStyleSheets({
  [themes.light]: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: font.size,
  },
});

export const ThemeReactNativeStylexSheet = (props: any) => {
  const stylex = useStylex();
  return createElement(
    Text,
    { style: themeStyle[stylex.theme].default || themeStyles[stylex.theme] },
    Children.only(props.children)
  );
};
