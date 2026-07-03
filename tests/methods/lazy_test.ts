'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { LazyCollection } from '../../src/lazyCollection'
import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should return a LazyCollection instance', () => {
    const collection = collect([1, 2, 3])
    const lazy = collection.lazy()

    expect(lazy).to.be.an.instanceOf(LazyCollection)
  })

  it('should not mutate the original collection', () => {
    const collection = collect([1, 2, 3, 4])

    collection.lazy().map((n) => n * 2).all()

    expect(collection.all()).to.eql([1, 2, 3, 4])
  })

  it('should lazily evaluate chained operations', () => {
    const collection = collect([1, 2, 3, 4, 5, 6])

    const result = collection
      .lazy()
      .filter((n) => n % 2 === 0)
      .map((n) => n * 10)
      .all()

    expect(result).to.eql([20, 40, 60])
  })

  it('should expose the values of an object based collection', () => {
    const collection = collect({ a: 1, b: 2, c: 3 })

    expect(collection.lazy().all()).to.eql([1, 2, 3])
  })

  it('should round-trip back to a Collection through eager()', () => {
    const collection = collect([1, 2, 3])

    const eager = collection.lazy().map((n) => n + 1).eager()

    expect(eager.constructor.name).to.eql('Collection')
    expect(eager.all()).to.eql([2, 3, 4])
  })
}
