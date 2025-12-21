import { describe, expect, it } from 'vitest'

import path from 'node:path'
import { readdirSync } from 'node:fs'

let test = process.argv[process.argv.length - 1]
const runSingleTest = test.indexOf('--') !== -1
test = test.replace('--', '')
test += '_test.js'

const tests = readdirSync(path.join(process.cwd(), './tests/methods'))

// tests.filter(e => ['shift_test.ts'].includes(e)).forEach((file) => {
tests.forEach((file) => {
    describe(file.replace('_test.js', '()'), async () => {
        if (!runSingleTest) {
            (await import(path.join(process.cwd(), './tests/methods', file))).default(it, expect)
        } else if (runSingleTest && file === test) {
            (await import(path.join(process.cwd(), './tests/methods', file))).default(it, expect)
        }
    })
}) 