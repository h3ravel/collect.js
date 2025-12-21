'use strict'

import util from 'node:util'

/**
 * Values helper
 *
 * Retrieve values from [this.items] when it is an array, object or Collection
 *
 * @param items
 */
export default function values<X> (items: X[] | (abstract new () => any) | Record<string, X>) {
  const valuesArray = []

  if (Array.isArray(items)) {
    valuesArray.push(...items)
  } else if (items.constructor.name === 'Collection') {
    valuesArray.push(...(items as any).all())
  } else if (typeof items === 'object') {
    valuesArray.push(...Object.values(items))
  }

  return valuesArray
}

export const inspect = (thing: any) => {
  return util.inspect(thing, {
    showHidden: false,
    depth: 2,
    colors: true,
    compact: true
  })
}