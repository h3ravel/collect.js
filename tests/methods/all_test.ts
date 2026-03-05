'use strict'

import { Collection, collect } from '../../src/collection'
import { ExpectStatic, TestAPI } from 'vitest'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should return all items, simple array', () => {
    expect(collect([1, 2, 3, 4, 5]).all()).to.eql([1, 2, 3, 4, 5])
  })

  it('should recursively return all items', () => {
    const collectionOfCollections = collect([
      collect([1, 2, 3]),
      collect([4, 5, 6, collect([7, 8, 9]), [10, 11, 12]]),
    ])

    expect(collectionOfCollections.all()).to.eql([
      collect([1, 2, 3]),
      collect([4, 5, 6, collect([7, 8, 9]), [10, 11, 12]]),
    ])
  })

  it('should return all items when collection is an object', () => {
    const collection = collect({
      name: 'Darwin Núñez',
    })

    expect(collection.all()).to.eql({
      name: 'Darwin Núñez',
    })
  })

  it('should return all items when containing objects', () => {
    const collection = collect({
      name: {
        first: 'Darwin',
        last: 'Núñez',
      },
    })

    expect(collection.all()).to.eql({
      name: {
        first: 'Darwin',
        last: 'Núñez',
      },
    })
  })

  it('should return all items containing functions', () => {
    const collection = collect({
      fn: () => 2 + 2,
    })

    const all = collection.all()
    expect(all).to.have.property('fn')
    expect(all.fn).to.be.instanceOf(Function)
    expect(all.fn()).to.eql(4)
  })

  it('should infer all() return type when collection is initialized with make()', () => {
    const objCollection = Collection.make({ name: 'Darwin Núñez' })
    const all = objCollection.all()
    const typedAll: { name: string } = all

    expect(typedAll).to.have.property('name')
    expect(typedAll.name).to.eql('Darwin Núñez')

    const arrayCollection = Collection.make([{ id: 1 }, { id: 2 }])
    const arrayAll = arrayCollection.all()
    const typedArrayAll: { id: number }[] = arrayAll

    expect(typedArrayAll).to.have.length(2)
    expect(typedArrayAll[0].id).to.eql(1)
  })

  it('should infer all() return type when collection is initialized with new Collection()', () => {
    const arrayCollection = new Collection([{ id: 1 }, { id: 2 }])
    const arrayAll = arrayCollection.all()
    const typedArrayAll: { id: number }[] = arrayAll

    expect(typedArrayAll).to.have.length(2)
    expect(typedArrayAll[0].id).to.eql(1)

    const objectCollection = new Collection({ id: 1, na: 2 })
    const objectAll = objectCollection.all()
    const typedObjectAll: { id: number, na: number } = objectAll

    expect(typedObjectAll).to.have.property('id')
    expect(typedObjectAll.id).to.eql(1)
  })

  it('should infer all() return type when collection is initialized with instance make()', () => {
    const arrayCollection = new Collection().make([{ id: 1 }, { id: 2 }])
    const arrayAll = arrayCollection.all()
    const typedArrayAll: { id: number }[] = arrayAll

    expect(typedArrayAll).to.have.length(2)
    expect(typedArrayAll[0].id).to.eql(1)

    const objectCollection = new Collection().make({ id: 1, na: 2 })
    const objectAll = objectCollection.all()
    const typedObjectAll: { id: number, na: number } = objectAll

    expect(typedObjectAll).to.have.property('id')
    expect(typedObjectAll.id).to.eql(1)
  })

  it('should infer all() return type based on provided collection value', () => {
    const arrayCollection = collect([{ id: 1 }, { id: 2 }])
    const arrayAll = arrayCollection.all()
    const typedArrayAll: { id: number }[] = arrayAll

    expect(typedArrayAll).to.have.length(2)
    expect(typedArrayAll[0].id).to.eql(1)

    const objectCollection = collect({ id: 1, na: 2 })
    const objectAll = objectCollection.all()
    const typedObjectAll: { id: number, na: number } = objectAll

    expect(typedObjectAll).to.have.property('id')
    expect(typedObjectAll.id).to.eql(1)
  })
}
