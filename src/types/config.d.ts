/* eslint-disable */
import type * as CSSUtil from './css-util';
import type StylexInterface from './stylex';

/** Configuration Interface */
declare namespace ConfigType {
  /** Media interface. */
  export type Media<T = {}> = {
    [name in keyof T]: T[name] extends string ? T[name] : string | boolean;
  };

  /** Utility interface. */
  export type Utils<T = {}> = {
    [Property in keyof T]: T[Property] extends (value: infer V) => {}
      ?
          | T[Property]
          | ((value: V) => {
              [K in keyof CSSUtil.CSSProperties]?: CSSUtil.CSSProperties[K] | V;
            })
      : never;
  };
}

/** Default CSS-property-to-scale mapping (kept for compatibility with CSSUtil types). */
export interface DefaultThemeMap {
  backgroundColor: 'colors';
  border: 'colors';
  borderBottomColor: 'colors';
  borderColor: 'colors';
  borderEndColor: 'colors';
  borderLeftColor: 'colors';
  borderRightColor: 'colors';
  borderStartColor: 'colors';
  borderTopColor: 'colors';
  color: 'colors';
  overlayColor: 'colors';
  shadowColor: 'colors';
  textDecoration: 'colors';
  textShadowColor: 'colors';
  tintColor: 'colors';
  borderBottomLeftRadius: 'radii';
  borderBottomRightRadius: 'radii';
  borderBottomStartRadius: 'radii';
  borderBottomEndRadius: 'radii';
  borderRadius: 'radii';
  borderTopLeftRadius: 'radii';
  borderTopRightRadius: 'radii';
  borderTopStartRadius: 'radii';
  borderTopEndRadius: 'radii';
  bottom: 'space';
  left: 'space';
  margin: 'space';
  marginBottom: 'space';
  marginEnd: 'space';
  marginHorizontal: 'space';
  marginLeft: 'space';
  marginRight: 'space';
  marginStart: 'space';
  marginTop: 'space';
  marginVertical: 'space';
  padding: 'space';
  paddingBottom: 'space';
  paddingEnd: 'space';
  paddingHorizontal: 'space';
  paddingLeft: 'space';
  paddingRight: 'space';
  paddingStart: 'space';
  paddingTop: 'space';
  paddingVertical: 'space';
  right: 'space';
  top: 'space';
  flexBasis: 'sizes';
  height: 'sizes';
  maxHeight: 'sizes';
  maxWidth: 'sizes';
  minHeight: 'sizes';
  minWidth: 'sizes';
  width: 'sizes';
  fontFamily: 'fonts';
  fontSize: 'fontSizes';
  fontWeight: 'fontWeights';
  lineHeight: 'lineHeights';
  letterSpacing: 'letterSpacings';
  zIndex: 'zIndices';
  borderWidth: 'borderWidths';
  borderTopWidth: 'borderWidths';
  borderRightWidth: 'borderWidths';
  borderBottomWidth: 'borderWidths';
  borderLeftWidth: 'borderWidths';
  borderStartWidth: 'borderWidths';
  borderEndWidth: 'borderWidths';
  borderStyle: 'borderStyles';
}

/** Returns a function used to create a new StyleX-like interface. */
export type CreateStylex = {
  <Media extends {} = {}, Utils extends {} = {}>(config?: {
    media?: ConfigType.Media<Media>;
    utils?: ConfigType.Utils<Utils>;
  }): StylexInterface<Media, Utils>;
};
