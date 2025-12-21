'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  const data = {
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
  }

  const diff = {
    b: 'b',
    d: 'd',
  }

  it('should compare the collection against a plain JavaScript object based on its keys', () => {
    const collection = collect(data)
    const difference = collection.diffKeys(diff)

    expect(difference.all()).to.eql({ a: 'a', c: 'c' })
    expect(collection.all()).to.eql(data)
  })

  it('should compare the collection against another collection based on its keys', () => {
    const collection = collect(data)
    const diffCollection = collect(diff)

    const difference = collection.diffKeys(diffCollection)
    expect(difference.all()).to.eql({ a: 'a', c: 'c' })
  })
}
