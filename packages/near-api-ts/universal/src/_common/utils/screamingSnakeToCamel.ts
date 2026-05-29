type StripLeadingUnderscore<S extends string> = S extends `_${infer Rest}`
  ? StripLeadingUnderscore<Rest>
  : S;

type ScreamingSnakeToCamelImpl<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Lowercase<Head>}${Capitalize<ScreamingSnakeToCamelImpl<Tail>>}`
  : Lowercase<S>;

type ScreamingSnakeToCamel<S extends string> = ScreamingSnakeToCamelImpl<StripLeadingUnderscore<S>>;

export const screamingSnakeToCamel = <S extends string>(input: S): ScreamingSnakeToCamel<S> => {
  const words = input.toLowerCase().split('_');
  const first = words.findIndex((w) => w.length > 0);
  return words
    .map((word, i) => (i <= first ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('') as ScreamingSnakeToCamel<S>;
};