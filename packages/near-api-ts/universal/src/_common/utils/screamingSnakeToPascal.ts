type ScreamingSnakeToPascal<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Lowercase<Head>>}${ScreamingSnakeToPascal<Tail>}`
    : Capitalize<Lowercase<S>>;

export const screamingSnakeToPascal = <S extends string>(input: S): ScreamingSnakeToPascal<S> =>
  input
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') as ScreamingSnakeToPascal<S>;
