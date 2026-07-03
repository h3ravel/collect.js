'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { Collection } from '../../src/collection'
import { LazyCollection } from '../../src/lazyCollection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should build from an array, object, iterable and generator', () => {
    expect(new LazyCollection([1, 2, 3]).all()).to.eql([1, 2, 3])
    expect(new LazyCollection({ a: 1, b: 2 }).all()).to.eql([1, 2])
    expect(new LazyCollection(new Set([1, 2, 2, 3])).all()).to.eql([1, 2, 3])
    expect(LazyCollection.make(function* () {
      yield 1
      yield 2
    }).all()).to.eql([1, 2])
  })

  it('should be re-enumerable', () => {
    const lazy = LazyCollection.make(function* () {
      yield 1
      yield 2
      yield 3
    })

    expect(lazy.all()).to.eql([1, 2, 3])
    expect(lazy.all()).to.eql([1, 2, 3])
    expect(lazy.map((n) => n * 2).all()).to.eql([2, 4, 6])
  })

  it('should NOT exhaust an infinite generator when using take', () => {
    let produced = 0

    const naturals = LazyCollection.make(function* () {
      let n = 1
      while (true) {
        produced += 1
        yield n
        n += 1
      }
    })

    const result = naturals.filter((n) => n % 3 === 0).take(2).all()

    expect(result).to.eql([3, 6])
    // Only the first 6 numbers were ever generated to satisfy take(2)
    expect(produced).to.eql(6)
  })

  it('should short-circuit first on an infinite generator', () => {
    const naturals = LazyCollection.make(function* () {
      let n = 1
      while (true) {
        yield n
        n += 1
      }
    })

    expect(naturals.first((n) => n > 100)).to.eql(101)
  })

  it('should short-circuit takeUntil / takeWhile', () => {
    const naturals = LazyCollection.make(function* () {
      let n = 1
      while (true) {
        yield n
        n += 1
      }
    })

    expect(naturals.takeUntil((n) => n === 4).all()).to.eql([1, 2, 3])
    expect(naturals.takeWhile((n) => n < 4).all()).to.eql([1, 2, 3])
  })

  it('should call tapEach once per pulled item and only for pulled items', () => {
    const tapped: number[] = []

    const result = LazyCollection.make(function* () {
      let n = 1
      while (true) {
        yield n
        n += 1
      }
    })
      .tapEach((n) => tapped.push(n))
      .take(3)
      .all()

    expect(result).to.eql([1, 2, 3])
    expect(tapped).to.eql([1, 2, 3])
  })

  it('should enumerate the source at most once with remember', () => {
    let produced = 0

    const lazy = LazyCollection.make(function* () {
      for (let n = 1; n <= 3; n += 1) {
        produced += 1
        yield n
      }
    }).remember()

    expect(lazy.all()).to.eql([1, 2, 3])
    expect(lazy.all()).to.eql([1, 2, 3])
    expect(produced).to.eql(3)
  })

  it('should stop the underlying source with takeUntilTimeout', () => {
    const past = new Date(Date.now() - 1000)

    const result = LazyCollection.make(function* () {
      let n = 1
      while (true) {
        yield n
        n += 1
      }
    }).takeUntilTimeout(past).all()

    expect(result).to.eql([])
  })

  it('should support skip, slice, nth and unique', () => {
    expect(new LazyCollection([1, 2, 3, 4, 5]).skip(2).all()).to.eql([3, 4, 5])
    expect(new LazyCollection([1, 2, 3, 4, 5]).slice(1, 2).all()).to.eql([2, 3])
    expect(new LazyCollection([1, 2, 3, 4, 5, 6]).nth(2).all()).to.eql([1, 3, 5])
    expect(new LazyCollection([1, 1, 2, 2, 3]).unique().all()).to.eql([1, 2, 3])
  })

  it('should chunk lazily into Collections', () => {
    const chunks = new LazyCollection([1, 2, 3, 4, 5]).chunk(2).all()

    expect(chunks.length).to.eql(3)
    expect(chunks[0]).to.be.an.instanceOf(Collection)
    expect(chunks.map((c) => c.all())).to.eql([[1, 2], [3, 4], [5]])
  })

  it('should filter with the where family', () => {
    const people = [
      { name: 'a', age: 20 },
      { name: 'b', age: 30 },
      { name: 'c', age: 40 },
    ]

    expect(new LazyCollection(people).where('age', '>', 25).pluck('name').all()).to.eql(['b', 'c'])
    expect(new LazyCollection(people).whereIn('age', [20, 40]).pluck('name').all()).to.eql(['a', 'c'])
    expect(new LazyCollection(people).whereBetween('age', [25, 45]).pluck('name').all()).to.eql(['b', 'c'])
  })

  it('should concat, prepend and push lazily', () => {
    expect(new LazyCollection([2, 3]).prepend(1).push(4).concat([5, 6]).all())
      .to.eql([1, 2, 3, 4, 5, 6])
  })

  it('should flatten and flatMap', () => {
    expect(new LazyCollection([[1, 2], [3, 4]]).flatten().all()).to.eql([1, 2, 3, 4])
    expect(new LazyCollection([1, 2]).flatMap((n) => [n, n * 10]).all()).to.eql([1, 10, 2, 20])
  })

  it('should provide materializing terminals', () => {
    const lazy = new LazyCollection([1, 2, 3, 4])

    expect(lazy.sum()).to.eql(10)
    expect(lazy.avg()).to.eql(2.5)
    expect(lazy.min()).to.eql(1)
    expect(lazy.max()).to.eql(4)
    expect(lazy.count()).to.eql(4)
    expect(lazy.last()).to.eql(4)
    expect(lazy.contains(3)).to.eql(true)
    expect(lazy.contains(9)).to.eql(false)
    expect(lazy.isEmpty()).to.eql(false)
    expect(new LazyCollection([]).isEmpty()).to.eql(true)
    expect(lazy.reduce((carry, item) => (carry ?? 0) + item, 0)).to.eql(10)
  })

  it('should materialize whole-dataset operations then continue lazily', () => {
    expect(new LazyCollection([3, 1, 2]).sort().all()).to.eql([1, 2, 3])
    expect(new LazyCollection([1, 2, 3]).reverse().all()).to.eql([3, 2, 1])

    const grouped = new LazyCollection([1, 2, 3, 4]).groupBy((n) => (n % 2 === 0 ? 'even' : 'odd'))
    expect(grouped).to.be.an.instanceOf(LazyCollection)
    expect(grouped.all().map((g) => g.all())).to.eql([[1, 3], [2, 4]])
  })

  it('should convert to Collection via eager and collect', () => {
    const eager = new LazyCollection([1, 2, 3]).eager()

    expect(eager).to.be.an.instanceOf(Collection)
    expect(eager.all()).to.eql([1, 2, 3])
    expect(new LazyCollection([1, 2, 3]).collect().all()).to.eql([1, 2, 3])
  })

  it('should round-trip Collection -> lazy -> Collection', () => {
    const source = new Collection([1, 2, 3, 4])

    const result = source
      .lazy()
      .filter((n) => n > 1)
      .map((n) => n * 2)
      .eager()

    expect(result.all()).to.eql([4, 6, 8])
  })
}
