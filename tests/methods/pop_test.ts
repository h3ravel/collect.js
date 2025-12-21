'use strict'

import { Collection, collect } from '../../src/collection'
import { ExpectStatic, TestAPI } from 'vitest'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should remove and returns the last item from the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])

    expect(collection.pop()).to.eql(5)
    expect(collection.all()).to.eql([1, 2, 3, 4])
  })

  it('should remove and returns the last n items from the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])

    expect(collection.pop(2)).to.eql(collect([4, 5]))
    expect(collection.all()).to.eql([1, 2, 3])
  })

  it('should work when collection is an array of objects', () => {
    const collection = collect([
      {
        name: 'Darwin Núñez',
        club: 'Liverpool FC',
      },
      {
        name: 'Roberto Firmino',
        club: 'Liverpool FC',
      },
      {
        name: 'Mohamed Salah',
        club: 'Liverpool FC',
      },
    ])

    expect(collection.pop()).to.eql({
      name: 'Mohamed Salah',
      club: 'Liverpool FC',
    })

    expect(collection.all()).to.eql([
      {
        name: 'Darwin Núñez',
        club: 'Liverpool FC',
      },
      {
        name: 'Roberto Firmino',
        club: 'Liverpool FC',
      },
    ])
  })

  it('should return the last value when collection is based on an object', () => {
    const collection = collect({
      name: 'Mohamed Salah',
      club: 'Liverpool FC',
    })

    expect(collection.pop()).to.eql('Liverpool FC')

    expect(collection.all()).to.eql({
      name: 'Mohamed Salah',
    })
  })

  it('should return the last n values when collection is based on an object', () => {
    const collection = collect({
      name: 'Mohamed Salah',
      club: 'Liverpool FC',
      country: 'Egypt',
    })

    expect(collection.pop(2)).to.eql(collect({
      club: 'Liverpool FC',
      country: 'Egypt',
    }))

    expect(collection.all()).to.eql({
      name: 'Mohamed Salah',
    })
  })

  it('should work with strings', () => {
    expect(collect('xoxo').pop()).to.eql('xoxo')
    expect((collect('xoxo').pop(20) as Collection).first()).to.eql('xoxo')
  })

  it('should return undefined when popping an empty collection', () => {
    expect(collect().pop()).to.eql(undefined)
    expect(collect([]).pop()).to.eql(undefined)
    expect(collect({}).pop()).to.eql(undefined)
  })
}
