'use strict'

import variadic from './variadic'

/**
 * Delete keys helper
 *
 * Delete one or multiple keys from an object
 *
 * @param obj
 * @param keys
 */
export default function deleteKeys<X extends Record<string, any> = any> (obj: X, ...keys: any[]) {
  variadic(keys).forEach((key) => {
    delete obj[key]
  })
}
