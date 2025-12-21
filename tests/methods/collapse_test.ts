'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should collapse a collection of arrays into a flat collection', () => {
    const collection = collect([[1], [{ name: 'Daniel' }, 5], ['xoxo']])
    const collapsed = collection.collapse()

    expect(collapsed.all()).to.eql([1, { name: 'Daniel' }, 5, 'xoxo'])
  })
}
