import { describe, expect, it } from 'vitest';
import { screamingSnakeToPascal } from '../../../src/_common/utils/screamingSnakeToPascal';

describe('screamingSnakeToPascal', () => {
  it.each([
    ['SUCCESS_VALUE', 'SuccessValue'],
    ['SUCCESS_RECEIPT_ID', 'SuccessReceiptId'],
    ['FAILURE', 'Failure'],
    ['ACTION_ERROR', 'ActionError'],
    ['INVALID_TX_ERROR', 'InvalidTxError'],
    ['NOT_STARTED', 'NotStarted'],
    ['INCLUDED_FINAL', 'IncludedFinal'],
    ['EXECUTED_OPTIMISTIC', 'ExecutedOptimistic'],
    ['A', 'A'],
    ['A_B_C', 'ABC'],
    ['ONE_TWO_THREE_FOUR', 'OneTwoThreeFour'],
  ])('converts %s to %s', (input, expected) => {
    expect(screamingSnakeToPascal(input)).toBe(expected);
  });

  it('handles empty string', () => {
    expect(screamingSnakeToPascal('')).toBe('');
  });

  it('handles single lowercase segment', () => {
    expect(screamingSnakeToPascal('hello')).toBe('Hello');
  });

  it('handles already lowercase snake case', () => {
    expect(screamingSnakeToPascal('hello_world')).toBe('HelloWorld');
  });

  it('handles mixed case input', () => {
    expect(screamingSnakeToPascal('Hello_World')).toBe('HelloWorld');
  });

  it('handles consecutive underscores', () => {
    expect(screamingSnakeToPascal('FOO__BAR')).toBe('FooBar');
  });

  it('handles leading underscore', () => {
    expect(screamingSnakeToPascal('_FOO_BAR')).toBe('FooBar');
  });

  it('handles trailing underscore', () => {
    expect(screamingSnakeToPascal('FOO_BAR_')).toBe('FooBar');
  });

  it('preserves digits within segments', () => {
    expect(screamingSnakeToPascal('FOO_123_BAR')).toBe('Foo123Bar');
  });

  it('returns a type-narrowed PascalCase string', () => {
    const value: 'SuccessValue' = screamingSnakeToPascal('SUCCESS_VALUE');
    expect(value).toBe('SuccessValue');
  });
});
