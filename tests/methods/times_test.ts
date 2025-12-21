'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should create a new collection by invoking the callback a given amount of times', () => {
    const collection = collect().times(10, number => number * 9)

    expect(collection.all()).to.eql([9, 18, 27, 36, 45, 54, 63, 72, 81, 90])
  })
}
