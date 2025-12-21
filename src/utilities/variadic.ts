'use strict'

/**
 * Variadic helper function
 *
 * @param args
 */
export default function variadic (args: any[]) {
  if (Array.isArray(args[0])) {
    return args[0]
  }

  return args
}
