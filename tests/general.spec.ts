import { Collection, collect } from '../src/collection'
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

import path from 'node:path'

let test = process.argv[process.argv.length - 1]
const runSingleTest = test.indexOf('--') !== -1
test = test.replace('--', '')
test += '_test.js'

const tests = readdirSync(path.join(process.cwd(), './tests/methods'))
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(new Collection()))
    .filter(e => !['constructor', 'toJSON'].includes(e))


if (!runSingleTest) {
    describe('general tests', () => {
        it('should test every method', () => {
            const missingTests = collect(methods).diff(collect(tests).transform(t => t.replace(/_test\.ts/, ''))).all()
            expect(missingTests).to.eql([])
        })

        it('should document all methods in README.md', () => {
            const content = readFileSync(path.join(process.cwd(), './README.md'), 'utf-8')

            const re = /#### `(.*)\(\)`/g
            let matches = re.exec(content)

            const documentedMethods = []

            while (matches !== null) {
                documentedMethods.push(matches[1])
                matches = re.exec(content)
            }

            const missingDocumentation = collect(methods).transform(t => t.replace(/.js/, '')).diff(documentedMethods).all()
            expect(missingDocumentation).to.eql([])
        })

        it('should use correct heading in documentation files', () => {
            const docFiles = readdirSync(path.join(process.cwd(), './docs/api'), 'utf-8')

            docFiles.forEach((fileName) => {
                const content = readFileSync(path.join(process.cwd(), './docs/api', fileName), 'utf-8')

                const methodName = fileName.replace(/.md/, '')
                const expectedHeading = `# \`${methodName}()\``
                const actualHeading = content.split(/\n/)[0]

                expect(actualHeading).to.eql(expectedHeading)
            })
        })

        it('should document all methods in docs/api', () => {
            const docFiles = readdirSync(path.join(process.cwd(), './docs/api'), 'utf-8')
            const docsCollection = collect(docFiles).map(t => t.replace(/.md/, ''))
            const methodsCollection = collect(methods).map(t => t)

            expect(methodsCollection.diff(docsCollection).all()).to.eql([])
        })

        it('should not have any dependencies', () => {
            const content = readFileSync('package.json', { encoding: 'utf8' })
            const pckg = JSON.parse(content)

            expect(pckg.dependencies).to.eql(undefined)
        })
    })
}