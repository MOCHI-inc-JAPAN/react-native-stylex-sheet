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

/** Returns a function used to create a new StyleX-like interface. */
export type CreateStylex = {
  <Media extends {} = {}, Utils extends {} = {}>(config?: {
    media?: ConfigType.Media<Media>;
    utils?: ConfigType.Utils<Utils>;
  }): StylexInterface<Media, Utils>;
};
