'use strict'

import { ExpectStatic, TestAPI } from 'vitest'

import { collect } from '../../src/collection'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should filter collection to items that are an instance of x', () => {
    const Player = function p (name) {
      this.name = name
    }

    const Manager = function p (name) {
      this.name = name
    }

    const Firmino = new Player('Firmino')
    const Salah = new Player('Salah')
    const Klopp = new Manager('Klopp')

    const collection = collect([Firmino, Salah, Klopp])

    const filtered = collection.whereInstanceOf(Player)

    expect(filtered.all()).to.eql([Firmino, Salah])
    expect(collection.all()).to.eql([Firmino, Salah, Klopp])
  })
}
