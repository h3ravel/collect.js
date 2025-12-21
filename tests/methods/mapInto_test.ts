'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should map into a class', () => {
    const Person = function p (name) {
      this.name = name
    }

    const collection = collect(['Firmino', 'Núñez'])

    const data = collection.mapInto(Person)

    expect(data.all()).to.be.an('array')
    expect(data.first()).to.eql(new Person('Firmino'))
    expect(data.last()).to.eql(new Person('Núñez'))
  })
}
