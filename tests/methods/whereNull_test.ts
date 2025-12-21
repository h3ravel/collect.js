'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should remove all object where name is not null', () => {
    const collection = collect([{
      name: 'Mohamed Salah',
    }, {
      name: null,
    }, {
      name: 'Darwin Núñez',
    }])

    expect(collection.whereNull('name').all()).to.eql([{ name: null }])
  })

  it('should remove all values that are not null', () => {
    const collection = collect([1, 2, null, 3, 4])

    expect(collection.whereNull().all()).to.eql([null])
  })
}
