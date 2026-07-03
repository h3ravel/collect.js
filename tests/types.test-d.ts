'use strict'

import { LazyCollection, collect } from '../src'
import { Collection } from '../src/collection'
import { expectTypeOf, test } from 'vitest'

test('array sources keep an array shape through chaining', () => {
  expectTypeOf(collect([1, 2, 3]).all()).toEqualTypeOf<number[]>()
  expectTypeOf(collect([1, 2, 3]).filter((n) => n > 1).all()).toEqualTypeOf<number[]>()
  expectTypeOf(collect([1, 2, 3]).map((n) => `${n}`).all()).toEqualTypeOf<string[]>()
  expectTypeOf(collect([1, 2, 3]).reject((n) => n > 1).all()).toEqualTypeOf<number[]>()
  expectTypeOf(collect([1, 2, 3]).take(2).all()).toEqualTypeOf<number[]>()
  expectTypeOf(collect([1, 2, 3]).reverse().all()).toEqualTypeOf<number[]>()
})

test('map preserves object shape for object sources', () => {
  expectTypeOf(collect({ a: 1, b: 2 }).map((n) => n + 1).all()).toEqualTypeOf<Record<string, number>>()
  expectTypeOf(collect({ a: 1, b: 2 }).filter((n) => n > 1).all()).toEqualTypeOf<Record<string, number>>()
  expectTypeOf(collect({ a: 1, b: 2 }).take(1).all()).toEqualTypeOf<Record<string, number>>()
})

test('deep chains keep inferring instead of decaying to any', () => {
  const result = collect([1, 2, 3, 4])
    .filter((n) => n % 2 === 0)
    .map((n) => n * 10)
    .all()

  expectTypeOf(result).toEqualTypeOf<number[]>()
})

test('shape-changing methods report the right element and container types', () => {
  expectTypeOf(collect([1, 2, 3]).keys().all()).toEqualTypeOf<(string | number)[]>()
  expectTypeOf(collect([1, 2, 3, 4]).chunk(2).all()).toEqualTypeOf<Collection<number>[]>()
  expectTypeOf(collect([1, 1, 2]).countBy().all()).toEqualTypeOf<Record<string, number>>()
})

test('where always yields an array of items', () => {
  expectTypeOf(collect([{ v: 1 }, { v: 2 }]).where('v', 1).all())
    .toEqualTypeOf<{ v: number }[]>()
})

test('lazy collections thread element types and materialize to arrays', () => {
  expectTypeOf(collect([1, 2, 3]).lazy()).toEqualTypeOf<LazyCollection<number>>()
  expectTypeOf(collect(['a', 'bb']).lazy().map((s) => s.length).all()).toEqualTypeOf<number[]>()
  expectTypeOf(LazyCollection.make([1, 2, 3]).filter((n) => n > 1).all()).toEqualTypeOf<number[]>()
  expectTypeOf(collect([1, 2, 3]).lazy().eager()).toEqualTypeOf<Collection<number>>()
})
