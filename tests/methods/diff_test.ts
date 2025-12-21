'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should return the missing values from collection', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const diff = collection.diff([1, 2, 3, 9])

    expect(diff.all()).to.eql([4, 5])
    expect(collection.all()).to.eql([1, 2, 3, 4, 5])
  })

  it('should accept a collection as an argument', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const diffCollection = collect([1, 2, 3, 9])

    const diff = collection.diff(diffCollection)

    expect(diff.all()).to.eql([4, 5])
  })
}
