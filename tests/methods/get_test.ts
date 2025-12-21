'use strict'

const data = {
  firstname: 'Darwin',
  lastname: 'Núñez',
}

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  const collection = collect(data)

  it('should return the item at a given key', () => {
    expect(collection.get('firstname')).to.eql('Darwin')
    expect(collection.get('name')).to.eql(undefined)
    expect(collection.all()).to.eql(data)
  })

  it('should accept a default value', () => {
    expect(collection.get('name', 'Daniel')).to.eql('Daniel')
    expect(collection.all()).to.eql(data)
  })

  it('should accept a callback as a default value', () => {
    expect(collection.get('name', () => 'Daniel')).to.eql('Daniel')
    expect(collection.all()).to.eql(data)
  })

  it('should handle having 0 as a default value', () => {
    expect(collection.get('missingKey')).to.eql(undefined)
    expect(collection.get('missingKey', 0)).to.eql(0)
    expect(collection.all()).to.eql(data)
  })
}
