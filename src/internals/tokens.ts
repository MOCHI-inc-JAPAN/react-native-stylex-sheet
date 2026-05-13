// モジュール内でユニークな ID を生成するカウンター
let _id = 0;
// pref を付けることで varsGroup / theme を区別しやすくする
function nextId(pref = ''): string {
  return `${pref}_${++_id}`;
}

/** defineVars() が返すトークンの型。スタイル値として create() に渡せる */
export type ThemeToken<T extends string | number = string | number> = {
  readonly __stylex_var__: true;
  readonly __varId: string; // トークンを一意に識別するキー
  readonly __default: T; // ThemeProvider がない場合に使われるデフォルト値
};

/** defineVars() の戻り値。入力オブジェクトの各キーを ThemeToken にマップする */
export type VarsGroup<
  T extends Record<string, string | number> = Record<string, string | number>
> = {
  readonly [K in keyof T]: ThemeToken<T[K]>;
};

/** createTheme() が返すテーマオーバーライド。ThemeProvider に渡して有効化する */
export type ThemeOverride = {
  readonly __stylex_theme__: true;
  readonly __themeId: string; // テーマを一意に識別するキー
  readonly __tokenValues: Record<string, string | number>; // varId → 解決済み値のマップ
};

/** 値が ThemeToken かどうかを判定するタイプガード */
export function isThemeToken(val: unknown): val is ThemeToken {
  return (
    val !== null &&
    typeof val === 'object' &&
    (val as Record<string, unknown>).__stylex_var__ === true
  );
}

/**
 * テーマ変数グループを定義する。
 * 返却された ThemeToken オブジェクトを create() のスタイル値として使うことで
 * ThemeProvider によるテーマ切り替えに対応できる。
 */
export function defineVars<T extends Record<string, string | number>>(
  defaults: T
): VarsGroup<T> {
  // グループ内の全トークンに共通のプレフィックスを付与し、衝突を防ぐ
  const groupId = nextId('vars');
  const out: Record<string, ThemeToken> = {};
  for (const [k, v] of Object.entries(defaults)) {
    out[k] = Object.freeze({
      __stylex_var__: true as const,
      __varId: `${groupId}_${k}`,
      __default: v,
    });
  }
  return Object.freeze(out) as VarsGroup<T>;
}

/**
 * 上書き不可の定数オブジェクトを定義する。
 * ThemeProvider の影響を受けず、常に固定値として扱われる。
 */
export function defineConsts<
  T extends Record<string, string | number | boolean>
>(consts: T): Readonly<T> {
  return Object.freeze({ ...consts });
}

/**
 * vars グループに対するテーマオーバーライドを作成する。
 * overrides には vars の全キーの上書き値を指定する必要がある。
 * 戻り値を ThemeProvider の theme prop に渡すと有効化される。
 */
export function createTheme<
  T extends VarsGroup<Record<string, string | number>>
>(vars: T, overrides: { [K in keyof T]: string | number }): ThemeOverride {
  const themeId = nextId();
  // varId → 上書き値 のマップを構築する（overrides にない場合はデフォルト値を使用）
  const tokenValues: Record<string, string | number> = {};
  for (const [k, token] of Object.entries(vars)) {
    const t = token as ThemeToken;
    tokenValues[t.__varId] =
      (overrides as Record<string, string | number>)[k] ?? t.__default;
  }
  return Object.freeze({
    __stylex_theme__: true as const,
    __themeId: themeId,
    __tokenValues: tokenValues,
  });
}
