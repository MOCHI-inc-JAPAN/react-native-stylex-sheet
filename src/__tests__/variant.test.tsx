import * as stylex from '../';
import { Variants } from '../utils/types';
import { reduceStyles } from './utils/test-utils';

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

describe('Variants', () => {
  it('variant key symbol can be detected', () => {
    // const sym = Symbol();
    // const v = 'test';
    // (v as any)[sym] = true;
    // expect((v as any)[sym ]).toBe(true);
    // const variants = stylex.createVariants({
    //   test: {
    //     alignSelf: {
    //       default: 'center',
    //     }
    //   }
    // });
    // const variantKey = Object.keys(variants).find((key) => isXRNVariantsKey(key));
    // expect(variantKey).toBeDefined();
    // expect(isXRNVariantsKey(variantKey!)).toBe(true);
  });

  it('variants are applied correctly', () => {
    const vars = stylex.defineVars({
      colors: {
        default: 'white',
        primary: 'red',
        secondary: 'blue',
      },
      sizes: {
        default: 10,
        small: 5,
        medium: 15,
      },
    });

    const variants = stylex.createVariants({
      var1: {
        backgroundColor: vars.colors,
      },
      var2: {
        width: vars.sizes,
      },
    });

    const styles = stylex.create({
      view: {
        backgroundColor: variants.var1.backgroundColor,
        width: variants.var2.width,
      },
    });

    expect(stylex.props(styles.view).style[0]).toMatchObject({
      backgroundColor: 'white',
      width: 10,
    });

    expect(stylex.props(styles.view).style.length).toBe(1);

    expect(
      stylex.props(
        stylex.mix<Variants<typeof variants>>(styles.view, {
          var1: 'primary',
          var2: 'medium',
        })
      ).style
    ).toMatchObject([
      {
        backgroundColor: 'white',
        width: 10,
      },
      {
        backgroundColor: 'red',
      },
      {
        width: 15,
      },
    ]);
  });

  it('multiple style have same variant value is applied correctly', () => {
    const variants = stylex.createVariants({
      shape: {
        borderRadius: {
          default: 4,
          round: 8,
          square: 0,
          test: 1,
        },
        fontSize: {
          default: 14,
          round: 16,
          square: 18,
        },
      },
    });
    const styles = stylex.create({
      view: {
        ...variants.shape,
      },
    });

    expect(
      reduceStyles(
        stylex.props(
          stylex.mix<Variants<typeof variants>>(styles.view, {
            shape: 'round',
          })
        ).style
      )
    ).toMatchObject({ borderRadius: 8, fontSize: 16 });
    expect(
      reduceStyles(
        stylex.props(
          stylex.mix<Variants<typeof variants>>(styles.view, {
            shape: 'test',
          })
        ).style
      )
    ).toMatchObject({ borderRadius: 1, fontSize: 14 });
  });
});
