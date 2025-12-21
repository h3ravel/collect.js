'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should prepend an item to the beginning of the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])

    expect(collection.prepend(0).all()).to.eql([0, 1, 2, 3, 4, 5])
    expect(collection.all()).to.eql([0, 1, 2, 3, 4, 5])
  })

  it('should work when collection is based on an object', () => {
    const collection2 = collect({
      firstname: 'Daniel',
    })

    expect(collection2.prepend('Eckermann', 'lastname').all()).to.eql({
      firstname: 'Daniel',
      lastname: 'Eckermann',
    })

    expect(collection2.all()).to.eql({
      lastname: 'Eckermann',
      firstname: 'Daniel',
    })
  })
}
