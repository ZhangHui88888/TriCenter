import { expect, test } from 'vitest';
import { serializeCategoryPaths, serializeFilterValues } from '../src/utils/multiSelectFilters';

test('serializes multiple source IDs and funnel stages without losing selections', () => {
  expect(serializeFilterValues([12, 34])).toBe('12,34');
  expect(serializeFilterValues(['HAS_DEMAND', 'SIGNED'])).toBe('HAS_DEMAND,SIGNED');
});

test('cleared selections omit query parameters and allow toolbar fallback', () => {
  for (const value of [[], undefined, null, '', [' ', null]]) {
    expect(serializeFilterValues(value)).toBeUndefined();
  }
  expect(serializeFilterValues([]) || 'POTENTIAL').toBe('POTENTIAL');
});

test('retains legacy single values and removes duplicate selections', () => {
  expect(serializeFilterValues(12)).toBe('12');
  expect(serializeFilterValues('SIGNED')).toBe('SIGNED');
  expect(serializeFilterValues([12, '12', 34])).toBe('12,34');
});

test('multiple category paths send selected nodes, not ancestor IDs or flattened paths', () => {
  expect(serializeCategoryPaths([[1, 11, 111], [2, 22], [3]])).toBe('111,22,3');
  expect(serializeCategoryPaths([[1, 11], [1, 11]])).toBe('11');
});

test('category serialization supports clearing and legacy single paths', () => {
  expect(serializeCategoryPaths([])).toBeUndefined();
  expect(serializeCategoryPaths([[]])).toBeUndefined();
  expect(serializeCategoryPaths([1, 11, 111])).toBe('111');
});
