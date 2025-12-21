'use strict'

/**
 * Clone helper
 *
 * Clone an array or object
 *
 * @param items
 */
export default function clone<X> (items: X[] | Record<string, X>) {
  if (Array.isArray(items)) {
    return [...items]
  } else {
    return { ...items }
  }
}
