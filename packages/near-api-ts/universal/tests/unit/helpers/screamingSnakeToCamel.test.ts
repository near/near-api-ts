import { describe, expect, it } from 'vitest';
import { screamingSnakeToCamel } from '../../../src/_common/utils/screamingSnakeToCamel';

describe('screamingSnakeToCamel', () => {
  it.each([
    ['SUCCESS_VALUE', 'successValue'],
    ['SUCCESS_RECEIPT_ID', 'successReceiptId'],
    ['FAILURE', 'failure'],
    ['ACTION_ERROR', 'actionError'],
    ['INVALID_TX_ERROR', 'invalidTxError'],
    ['NOT_STARTED', 'notStarted'],
    ['INCLUDED_FINAL', 'includedFinal'],
    ['EXECUTED_OPTIMISTIC', 'executedOptimistic'],
    ['A', 'a'],
    ['A_B_C', 'aBC'],
    ['ONE_TWO_THREE_FOUR', 'oneTwoThreeFour'],
  ])('converts %s to %s', (input, expected) => {
    expect(screamingSnakeToCamel(input)).toBe(expected);
  });

  it('handles empty string', () => {
    expect(screamingSnakeToCamel('')).toBe('');
  });

  it('handles single lowercase segment', () => {
    expect(screamingSnakeToCamel('hello')).toBe('hello');
  });

  it('handles already lowercase snake case', () => {
    expect(screamingSnakeToCamel('hello_world')).toBe('helloWorld');
  });

  it('handles mixed case input', () => {
    expect(screamingSnakeToCamel('Hello_World')).toBe('helloWorld');
  });

  it('handles consecutive underscores', () => {
    expect(screamingSnakeToCamel('FOO__BAR')).toBe('fooBar');
  });

  it('handles leading underscore', () => {
    expect(screamingSnakeToCamel('_FOO_BAR')).toBe('fooBar');
  });

  it('handles trailing underscore', () => {
    expect(screamingSnakeToCamel('FOO_BAR_')).toBe('fooBar');
  });

  it('preserves digits within segments', () => {
    expect(screamingSnakeToCamel('FOO_123_BAR')).toBe('foo123Bar');
  });

  it('returns a type-narrowed camelCase string', () => {
    const value: 'successValue' = screamingSnakeToCamel('SUCCESS_VALUE');
    expect(value).toBe('successValue');
  });
});
