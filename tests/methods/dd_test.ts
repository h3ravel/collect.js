'use strict'

import { ExpectStatic, TestAPI, vi } from 'vitest'

import { collect } from '../../src/collection'
import { inspect } from '../../src/utilities/values'

export default (it: TestAPI, expect: ExpectStatic) => {
  it('should dump the collection and exit the current process', () => {
    using spy = vi.spyOn(console, 'log').mockImplementation(() => { })
    using spyExit = vi.spyOn(process, 'exit').mockImplementation((code) => code as never)

    collect([1, 2, 3]).dd()

    expect(spy).toHaveBeenCalledWith(inspect(collect([1, 2, 3])))
    expect(spyExit).toHaveBeenCalledExactlyOnceWith(1)
  })
}
