'use strict'

import { ExpectStatic, TestAPI, vi } from 'vitest'

import { collect } from '../../src/collection'
import { inspect } from '../../src/utilities/values'

export default (it: TestAPI, expect: ExpectStatic) => {

  it('should console log the collection', () => {
    using spy = vi.spyOn(console, 'log').mockImplementation(() => { })

    collect([1, 2, 3]).dump()
    collect({ name: 'Darwin Núñez', number: 27 }).dump()

    expect(spy).toHaveBeenCalledWith(inspect(collect([1, 2, 3])))
    expect(spy).toHaveBeenCalledWith(inspect(collect({ name: 'Darwin Núñez', number: 27 })))
  })
}
