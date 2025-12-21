'use strict'

const products = [
  { product: 'Desk', price: 200, manufacturer: 'IKEA' },
  { product: 'Chair', price: 100, manufacturer: 'Herman Miller' },
  { product: 'Bookcase', price: 150, manufacturer: 'IKEA' },
  { product: 'Door', price: '100' },
]

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should return the first item where it matches', () => {
    const collection = collect(products)

    expect(collection.firstWhere('manufacturer', 'IKEA')?.product).to.eql('Desk')
  })

  it('should return null when no matches', () => {
    const collection = collect(products)

    expect(collection.firstWhere('manufacturer', 'xoxo')).to.eql(undefined)
  })

  it('should be possible to pass an operator', () => {
    const collection = collect(products)

    expect(collection.firstWhere('manufacturer', '!==', 'IKEA')?.product).to.eql('Chair')
  })
}
