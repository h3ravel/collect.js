'use strict'

import { filterArray, filterObject } from './utilities/filters'
import { isArray, isFunction, isObject } from './utilities/is'

import buildKeyPathMap from './utilities/buildKeyPathMap'
import clone from './utilities/clone'
import deleteKeys from './utilities/deleteKeys'
import getValues, { inspect } from './utilities/values'
import nestedValue from './utilities/nestedValue'
import variadic from './utilities/variadic'

type Operator = '===' | '==' | '!==' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | boolean
type GenericObj<X = any> = Record<string, X>

export class Collection<Item = any> {
    private items: Item[]

    /**
     * 
     * @param collection 
     */
    constructor(collection?: Record<string, Item> | Item[] | Item) {
        if (collection !== undefined && !Array.isArray(collection) && typeof collection !== 'object') {
            this.items = [collection]
        } else if (collection instanceof Collection) {
            this.items = collection.all()
        } else {
            this.items = (collection as Item[]) || []
        }

    };

    /**
     * The add method adds a single item to the collection.
     */
    add (item: Item): this {
        this.items.push(item)

        return this
    }

    /**
     * The all method returns the underlying array represented by the collection.
     */
    all (): Item extends Record<string, any> ? Item : Item[] {
        return this.items as never
    }

    /**
     * Alias for the avg() method.
     */
    average (key?: keyof Item | ((p: Item) => any)): number {
        return this.avg(key)
    }

    /**
     * The avg method returns the average of all items in the collection.
     */
    avg (key?: keyof Item | ((p: Item) => any)): number {
        if (!Array.isArray(this.items)) return 0

        if (typeof key === 'undefined') {
            return this.sum() / this.items.length
        }

        if (isFunction(key)) {
            return new Collection(this.items).sum(key) / this.items.length
        }

        return new Collection(this.items).pluck(key).sum() / this.items.length
    }

    /**
     * The chunk method breaks the collection into multiple, smaller collections of a given size.
     */
    chunk (size: number): Collection<Item[]> {
        const chunks = []
        let index = 0

        if (Array.isArray(this.items)) {
            do {
                const items = this.items.slice(index, index + size)
                const collection = new Collection(items)

                chunks.push(collection)
                index += size
            } while (index < this.items.length)
        } else if (typeof this.items === 'object') {
            const keys = Object.keys(this.items)

            do {
                const keysOfChunk = keys.slice(index, index + size)
                const collection = new Collection({})

                keysOfChunk.forEach(key => collection.put(key, this.items[key as never]))

                chunks.push(collection)
                index += size
            } while (index < keys.length)
        } else {
            chunks.push(new Collection([this.items]))
        }

        return new Collection(chunks) as never
    }

    /**
     * The collapse method collapses a collection of arrays into a single, flat collection.
     */
    collapse (): Collection<Item> {
        return new Collection<Item>([].concat(...getValues(this.items)))
    }

    /**
     * The combine method combines the keys of the collection with the values of another array or collection.
     */
    combine<U, T = Item> (array: U[] | Collection): Collection<T> {
        let values = array

        if (values instanceof Collection) {
            values = array instanceof Collection ? array.all() as U[] : array
        }

        const collection: GenericObj = {}

        if (Array.isArray(this.items) && Array.isArray(values)) {
            this.items.forEach((key, iterator) => {
                collection[key as never] = values[iterator]
            })
        } else if (typeof this.items === 'object' && typeof values === 'object') {
            Object.keys(this.items).forEach((key, index) => {
                collection[this.items[key as never] as never] = values[Object.keys(values)[index as number] as never]
            })
        } else if (Array.isArray(this.items)) {
            collection[this.items[0] as never] = values
        } else if (typeof this.items === 'string' && Array.isArray(values)) {
            [collection[this.items]] = values
        } else if (typeof this.items === 'string') {
            collection[this.items] = values
        }

        return new Collection(collection)
    }


    /**
     * The concat method is used to merge two or more collections/arrays/objects.
     */
    concat<T = Item> (collectionOrArrayOrObject: T[] | Record<string, T> | Collection<T>): any {
        let list: T[]

        if (collectionOrArrayOrObject instanceof Collection) {
            list = collectionOrArrayOrObject.all() as T[]
        } else if (Array.isArray(collectionOrArrayOrObject)) {
            list = collectionOrArrayOrObject
        } else {
            list = [...Object.values(collectionOrArrayOrObject)]
        }

        const collection = new Collection(clone(this.items))

        list.forEach((item) => {
            if (isObject(item)) {
                Object.keys(item).forEach(key => collection.push(item[key as never] as never))
            } else {
                collection.push(item as never)
            }
        })

        return collection
    }


    /**
     * The contains method determines whether the collection contains a given item.
     * 
     * @param key 
     * @param value 
     * @returns 
     */
    contains<V, K = Item> (key: keyof Item | K | ((...args: any[]) => any), value?: V): boolean {
        if (typeof value !== 'undefined') {
            if (Array.isArray(this.items)) {
                return this.items
                    .filter(items => (items as any)[key] !== undefined && (items as any)[key] === value)
                    .length > 0
            }

            return (this.items as any)[key] !== undefined && (this.items as any)[key] === value
        }

        if (isFunction(key)) {
            if (Array.isArray(this.items)) {
                return this.items.filter((item, index) => key(item, index)).length > 0
            }

            return Object.entries(this.items).filter((item, index) => key(item, index)).length > 0
        }

        if (Array.isArray(this.items)) {
            return this.items.indexOf(key as never) !== -1
        }

        const keysAndValues = getValues(this.items)
        keysAndValues.push(...Object.keys(this.items))

        return keysAndValues.indexOf(key) !== -1
    }

    /**
     * Check to ensure the collection only contains one item
     * 
     * @returns 
     */
    containsOneItem () {
        return this.count() === 1
    }

    /**
     * The count method returns the total number of items in the collection.
     */
    count (): number {
        let arrayLength = 0

        if (Array.isArray(this.items)) {
            arrayLength = this.items.length
        }

        return Math.max(Object.keys(this.items).length, arrayLength)
    }

    /**
     * 
     * @param fn 
     * @returns 
     */
    countBy (fn: ((value: Item) => any) = value => value): Collection<number> {
        return new Collection<Item>(this.items)
            .groupBy(fn)
            .map((value: any) => value.count())
    }

    /**
     * The crossJoin method cross joins the collection with the given array or collection, returning all possible permutations.
     */
    crossJoin<T = Item> (...values: (T[] | Collection)[]): Collection<[Item, T]> {
        function join (collection: any[], ...args: any[]) {
            let current = args[0]

            if (current instanceof Collection) {
                current = current.all()
            }

            const rest = args.slice(1)
            const last = !rest.length
            let result: any[] = []

            for (let i = 0; i < current.length; i += 1) {
                const collectionCopy = collection.slice()
                collectionCopy.push(current[i])

                if (last) {
                    result.push(collectionCopy)
                } else {
                    result = result.concat(join(collectionCopy, ...rest))
                }
            }

            return result
        }

        return new Collection(join([], this.items, ...values))
    }


    /**
     * The dd method will console.log the collection and exit the current process.
     */
    dd (...args: unknown[]): void {
        this.dump(args)

        if (typeof process !== 'undefined') {
            process.exit(1)
        }
    }

    /**
     * The diff method compares the collection against another collection or a plain array based on its values.
     * This method will return the values in the original collection that are not present in the given collection.
     */
    diff<T = Item> (values: T[] | Collection<Item>): Collection<Item> {
        let valuesToDiff: T[] | Item[]

        if (values instanceof Collection) {
            valuesToDiff = values.all() as never
        } else {
            valuesToDiff = values
        }

        const collection = this.items.filter(item => valuesToDiff.indexOf(item as never) === -1)

        return new Collection(collection)
    }


    /**
     * The diffAssoc method compares the collection against another collection or a plain object based on its keys
     * and values. This method will return the key / value pairs in the original collection that are not present in
     * the given collection:
     */
    diffAssoc<T = Item> (values: T[] | Collection<T>): Collection<Item> {
        let diffValues: any = values

        if (values instanceof Collection) {
            diffValues = values.all() as T[]
        }

        const collection: GenericObj = {}

        Object.keys(this.items).forEach((key) => {
            if (typeof diffValues[key] === 'undefined' || diffValues[key] !== (this.items as any)[key]) {
                collection[key] = (this.items as any)[key]
            }
        })

        return new Collection<Item>(collection)
    }

    /**
     * The diffKeys method compares the collection against another collection or a plain object based on its keys.
     * This method will return the key / value pairs in the original collection that are not present in the given collection.
     * 
     * @param object 
     * @returns 
     */
    diffKeys<K extends keyof Item> (object: object): Collection<K> {
        let objectToDiff

        if (object instanceof Collection) {
            objectToDiff = object.all()
        } else {
            objectToDiff = object
        }

        const objectKeys = Object.keys(objectToDiff)

        const remainingKeys = Object.keys(this.items)
            .filter(item => objectKeys.indexOf(item) === -1)

        return new Collection(this.items).only(remainingKeys) as never
    }

    /**
     * The diffKeys method compares the collection against another collection or a plain object based on the result of a given callback.
     * This method will return the key / value pairs in the original collection that are not present in the given collection.
     * 
     * @param object 
     * @returns 
     */
    diffUsing<T = Item> (values: T[] | Collection<Item>, callback: (item: Item, otherItem: Item) => any) {
        let items: Item[] | [string, Item][]

        if (Array.isArray(this.items)) {
            items = this.items
        } else {
            items = Object.entries(this.items)
        }

        const collection = items.filter(item => (
            !(values && values.some((otherItem: any) => callback(Array.isArray(item) ? item[1] : item, otherItem) === 0))
        ))

        return new Collection<Item>(collection as never)
    }


    /**
     * The doesntContain method determines whether the collection doesnt contain a given item.
     * 
     * @param key 
     * @param value 
     * @returns 
     */
    doesntContain<V> (key: keyof Item | ((...args: any[]) => any), value?: V): boolean {
        return !this.contains(key, value)
    }

    /**
     * The dot method allows accessing objects using the dot notation.
     */
    dot (): this {
        if (!isObject(this.items)) {
            return this
        }

        const sep = '.'
        const kv: GenericObj = {}

        const stringify = <X extends object> (obj: X, prev?: string) => {
            const entries = Object.entries(obj)
            for (let i = 0; i < entries.length; i += 1) {
                const [k, v] = entries[i]
                let key = k
                if (prev) {
                    key = prev + sep + key
                }

                if (isObject(v)) {
                    stringify(v, key)
                } else {
                    kv[key] = v
                }
            }
        }

        stringify(this.items)

        return new Collection(kv) as never
    }

    /**
     * The dump method outputs the results at that moment and then continues processing.
     */
    dump (...args: unknown[]): this {
        console.log(inspect(this))
        args.forEach((thing) => {
            console.log(inspect(thing))
        })

        return this
    }

    /**
     * The duplicates method will find and return all duplicate properties in a collection
     * 
     * @returns 
     */
    duplicates (): Collection<Item> {
        const occuredValues: any[] = []
        const duplicateValues: GenericObj = {}

        const stringifiedValue = (value: any) => {
            if (Array.isArray(value) || typeof value === 'object') {
                return JSON.stringify(value)
            }

            return value
        }

        if (Array.isArray(this.items)) {
            this.items.forEach((value, index) => {
                const valueAsString = stringifiedValue(value)

                if (occuredValues.indexOf(valueAsString) === -1) {
                    occuredValues.push(valueAsString)
                } else {
                    duplicateValues[index] = value
                }
            })
        } else if (typeof this.items === 'object') {
            Object.keys(this.items).forEach((key) => {
                const valueAsString = stringifiedValue(this.items[key as never])

                if (occuredValues.indexOf(valueAsString) === -1) {
                    occuredValues.push(valueAsString)
                } else {
                    duplicateValues[key] = this.items[key as never]
                }
            })
        }

        return new Collection<Item>(duplicateValues)
    }

    /**
     * The each method iterates over the items in the collection and passes each item to a callback.
     */
    each (fn: (currentItem: Item, key?: string | number, collection?: Item[]) => any): this {
        let stop = false

        if (Array.isArray(this.items)) {
            const { length } = this.items

            for (let index = 0; index < length && !stop; index += 1) {
                stop = fn(this.items[index], index, this.items) === false
            }
        } else {
            const keys = Object.keys(this.items)
            const { length } = keys

            for (let index = 0; index < length && !stop; index += 1) {
                const key = keys[index]

                stop = fn(this.items[key as never], key, this.items as never) === false
            }
        }

        return this
    }

    /**
     * 
     * @param fn 
     * @returns 
     */
    eachSpread (fn: (...items: any[]) => any) {
        this.each((values: any, key) => {
            fn(...values, key)
        })

        return this
    }

    /**
     * The every method may be used to verify that all elements of a collection pass a given truth test.
     */
    every (fn: (item: Item) => boolean): boolean {
        const items = getValues(this.items)

        return items.every(fn)
    }


    /**
     * The except method returns all items in the collection except for those with the specified keys.
     */
    except<K = Item> (...args: K[]): Collection<Item> {
        const properties = variadic(args)

        if (Array.isArray(this.items)) {
            const collection = this.items
                .filter(item => properties.indexOf(item) === -1)

            return new Collection(collection)
        }

        const collection: GenericObj = {}

        Object.keys(this.items).forEach((property) => {
            if (properties.indexOf(property) === -1) {
                collection[property] = this.items[property as never]
            }
        })

        return new Collection(collection)
    }

    /**
     * The filter method filters the collection using the given callback,
     * keeping only those items that pass a given truth test.
     */
    filter (fn: (item: Item) => boolean): Collection<Item>;
    filter (fn: (item: Item, key?: any) => boolean): Collection<Item> {
        const func = fn || false
        let filteredItems = null
        if (Array.isArray(this.items)) {
            filteredItems = filterArray(func, this.items)
        } else {
            filteredItems = filterObject(func, this.items)
        }

        return new Collection(filteredItems)
    }

    /**
     * The first method returns the first element in the collection that passes a given truth test.
     */
    first<V> (fn?: (item: Item, key: any) => boolean, defaultValue?: ((...any: any[]) => V | Item) | V | Item): Collection<Item> | undefined {
        if (isFunction(fn)) {
            const keys = Object.keys(this.items)

            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i]
                const item = this.items[key as never]

                if (fn(item, key)) {
                    return item as never
                }
            }

            if (isFunction(defaultValue)) {
                return defaultValue() as never
            }

            return defaultValue as never
        }

        if ((Array.isArray(this.items) && this.items.length) || (Object.keys(this.items).length)) {
            if (Array.isArray(this.items)) {
                return this.items[0] as never
            }

            const firstKey = Object.keys(this.items)[0]

            return this.items[firstKey] as never
        }

        if (isFunction(defaultValue)) {
            return defaultValue() as never
        }

        return defaultValue as never
    }

    /**
     * 
     * @param key 
     * @param operator 
     * @param value 
     * @returns 
     */
    firstOrFail<V> (key?: keyof Item, operator?: Operator, value?: V | null | undefined) {
        if (isFunction(key)) {
            return this.first(key, () => {
                throw new Error('Item not found.')
            }) as never
        }

        const collection = this.where(key, operator, value)

        if (collection.isEmpty()) {
            throw new Error('Item not found.')
        }

        return collection.first()
    }

    /**
     * 
     * @param key 
     * @param operator 
     * @param value 
     * @returns 
     */
    firstWhere<V, K = Item> (key?: keyof Item, operator?: Operator | K, value?: V | null | undefined) {
        return this.where(key, operator, value).first()
    }

    /**
     * The flatMap method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items.
     * Then, the array is flattened by a level.
     */
    flatMap<T = Item> (fn: (item: Item, key: any) => T): Collection<T> {
        return this.map(fn).collapse()
    }

    /**
     * The flatten method flattens a multi-dimensional collection into a single dimension.
     */
    flatten (depth?: number): Collection<Item> {
        let flattenDepth = depth || Infinity

        let fullyFlattened = false
        let collection: any[] = []

        const flat = function flat (items: any) {
            collection = []

            if (isArray(items)) {
                items.forEach((item) => {
                    if (isArray(item)) {
                        collection = collection.concat(item)
                    } else if (isObject(item)) {
                        Object.keys(item).forEach((property) => {
                            collection = collection.concat(item[property])
                        })
                    } else {
                        collection.push(item)
                    }
                })
            } else {
                Object.keys(items).forEach((property) => {
                    if (isArray(items[property])) {
                        collection = collection.concat(items[property])
                    } else if (isObject(items[property])) {
                        Object.keys(items[property]).forEach((prop) => {
                            collection = collection.concat(items[property][prop])
                        })
                    } else {
                        collection.push(items[property])
                    }
                })
            }

            fullyFlattened = collection.filter(item => isObject(item)).length === 0

            flattenDepth -= 1
        }

        flat(this.items)

        while (!fullyFlattened && flattenDepth > 0) {
            flat(collection)
        }

        return new Collection(collection)
    }

    /**
     * The flip method swaps the collection's keys with their corresponding values.
     */
    flip (): Collection<Item> {
        const collection: GenericObj = {}

        if (Array.isArray(this.items)) {
            Object.keys(this.items).forEach((key) => {
                collection[this.items[key as never] as never] = Number(key)
            })
        } else {
            Object.keys(this.items).forEach((key) => {
                collection[this.items[key as never] as never] = key
            })
        }

        return new Collection(collection)
    }


    /**
     * The forget method removes an item from the collection by its key.
     */
    forget<K = Item> (key: keyof Item | K): this {
        if (Array.isArray(this.items)) {
            this.items.splice(key as never, 1)
        } else {
            delete this.items[key as never]
        }

        return this
    }


    /**
     * The forPage method returns a new collection containing the items that would be present on a given page number.
     * The method accepts the page number as its first argument
     * and the number of items to show per page as its second argument.
     */
    forPage (page: number, chunk: number): Collection<Item> {
        let collection: GenericObj = {}

        if (Array.isArray(this.items)) {
            collection = this.items.slice((page * chunk) - chunk, page * chunk)
        } else {
            Object
                .keys(this.items)
                .slice((page * chunk) - chunk, page * chunk)
                .forEach((key) => {
                    collection[key] = this.items[key as never]
                })
        }

        return new Collection<Item>(collection)
    }


    /**
     * The get method returns the item at a given key. If the key does not exist, null is returned.
     */
    get<V, K = Item> (key: keyof Item | K, defaultValue?: ((...any: any[]) => V | Item) | V | Item) {
        if (typeof this.items[key as never] !== 'undefined') {
            return this.items[key as never]
        }

        if (isFunction(defaultValue)) {
            return defaultValue()
        }

        if (defaultValue !== null) {
            return defaultValue
        }

        return undefined
    }

    /**
     * The groupBy method groups the collection's items by a given key.
     *
     */
    groupBy<K, T = Item> (key: ((item: Item, index?: number) => K) | keyof Item | K): Collection<T> {
        const collection: GenericObj = {}

        if (Array.isArray(this.items)) {
            this.items.forEach((item, index) => {
                let resolvedKey

                if (isFunction(key)) {
                    resolvedKey = key(item, index)
                } else if (nestedValue(item, key as never) || nestedValue(item, key as never) === 0) {
                    resolvedKey = nestedValue(item, key as never)
                } else {
                    resolvedKey = ''
                }

                if (collection[resolvedKey] === undefined) {
                    collection[resolvedKey] = new Collection([])
                }

                collection[resolvedKey].push(item)
            })
        } else {
            Object.keys(this.items).forEach((index) => {
                let resolvedKey

                if (isFunction(key)) {
                    resolvedKey = key(this.items[index as never], index as never)
                } else if (nestedValue(this.items[index as never], key as never) || nestedValue(this.items[index as never], key) === 0) {
                    resolvedKey = nestedValue(this.items[index as never], key as never)
                } else {
                    resolvedKey = ''
                }

                if (collection[resolvedKey] === undefined) {
                    collection[resolvedKey] = new Collection([])
                }

                collection[resolvedKey].push(this.items[index as never])
            })
        }

        return new Collection(collection)
    }

    /**
     * The has method determines if one or more keys exists in the collection.
     */
    has (...args: any[]): boolean {
        const properties = variadic(args)

        return properties.filter(key => Object.hasOwnProperty.call(this.items, key)).length
            === properties.length
    }


    /**
     * The implode method joins the items in a collection.
     * Its arguments depend on the type of items in the collection.
     *
     * If the collection contains arrays or objects,
     * you should pass the key of the attributes you wish to join,
     * and the "glue" string you wish to place between the values.
     */
    implode<K = Item> (key: keyof Item | K, glue?: string): string {
        if (typeof glue === 'undefined' && Array.isArray(this.items)) {
            return this.items.join(String(key))
        }

        return new Collection(this.items).pluck(key).all().join(glue)
    }

    /**
     * The intersect method removes any values from the original collection
     * that are not present in the given array or collection.
     * The resulting collection will preserve the original collection's keys.
     */
    intersect (values: Item[] | Collection<Item>): Collection<Item> {
        let intersectValues: Item[] = values as never

        if (values instanceof Collection) {
            intersectValues = values.all() as Item[]
        }

        const collection = this.items
            .filter(item => intersectValues.indexOf(item) !== -1)

        return new Collection(collection)
    }


    /**
     * The intersectByKeys method removes any keys from the original collection
     * that are not present in the given array or collection.
     */
    intersectByKeys<K extends keyof Item> (values: Item | Collection<Item>): Collection<K> {
        let intersectKeys = Object.keys(values as never)

        if (values instanceof this.constructor) {
            intersectKeys = Object.keys(values.all())
        }

        const collection: GenericObj = {}

        Object.keys(this.items).forEach((key) => {
            if (intersectKeys.indexOf(key) !== -1) {
                collection[key as never] = this.items[key as never] as never
            }
        })

        return new Collection(collection) as never
    }

    /**
     * The isEmpty method returns true if the collection is empty; otherwise, false is returned.
     */
    isEmpty (): boolean {
        if (Array.isArray(this.items)) {
            return !this.items.length
        }

        return !Object.keys(this.items).length
    }


    /**
     * The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned.
     */
    isNotEmpty (): boolean {
        return !this.isEmpty()
    }

    /**
     * Join the items in a callection with the provided glue
     * 
     * @param glue 
     * @param finalGlue 
     * @returns 
     */
    join (glue: string, finalGlue: string) {
        const collection = this.values()

        if (finalGlue === undefined) {
            return collection.implode(glue)
        }

        const count = collection.count()

        if (count === 0) {
            return ''
        }

        if (count === 1) {
            return collection.last()
        }

        const finalItem = collection.pop()

        return collection.implode(glue) + finalGlue + finalItem
    }

    /**
     * The keyBy method keys the collection by the given key.
     * If multiple items have the same key, only the last one will appear in the new collection.
     */
    keyBy<K, T = Item> (key: keyof K | ((...args: any[]) => any)): Collection<T> {
        const collection: GenericObj = {}

        if (isFunction(key)) {
            this.items.forEach((item) => {
                collection[key(item)] = item
            })
        } else {
            this.items.forEach((item) => {
                const keyValue = nestedValue(item, key)

                collection[keyValue || ''] = item
            })
        }

        return new Collection(collection)
    }


    /**
     * The keys method returns all of the collection's keys.
     */
    keys (): Collection<string> {
        let collection = Object.keys(this.items)

        if (Array.isArray(this.items)) {
            collection = collection.map(Number) as never
        }

        return new Collection(collection)
    }

    /**
     * The last method returns the last element in the collection that passes a given truth test.
     */
    last (fn?: (item: Item) => boolean, defaultValue?: any): Item {
        let { items } = this

        if (isFunction(fn)) {
            items = this.filter(fn).all() as never
        }

        if ((Array.isArray(items) && !items.length) || (!Object.keys(items).length)) {
            if (isFunction(defaultValue)) {
                return defaultValue()
            }

            return defaultValue
        }

        if (Array.isArray(items)) {
            return items[items.length - 1]
        }
        const keys = Object.keys(items)

        return items[keys[keys.length - 1]]
    }

    /**
     * The macro method lets you register custom methods.
     */
    macro (name: string, fn: (...args: any[]) => any): void {
        this.constructor.prototype[name] = fn
    }

    /**
     * The make method will make a new collection from nothing
     * 
     * @param items 
     * @returns 
     */
    make<T = Item> (items = []): Collection<T> {
        return new Collection<T>(items)
    }

    /**
     * The map method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items.
     */
    map<T = Item> (fn: (items: Item, index: any, key?: any) => T): Collection<T> {
        if (Array.isArray(this.items)) {
            return new Collection(this.items.map(fn))
        }

        const collection: GenericObj = {}

        Object.entries(this.items).forEach(([key, value]) => {
            collection[key] = fn(value as never, key)
        })

        return new Collection(collection)
    }

    /**
     * The mapInto method iterates through the collection and instantiates the given class with each element as a constructor.
     */
    mapInto<T extends new (...args: any[]) => any> (ClassName: T): Collection<T> {
        return this.map((value, key) => new ClassName(value, key))
    }

    mapSpread (fn: (...items: Item[]) => any) {
        return this.map((values: any, key) => {
            return fn(...values, key)
        })
    }

    mapToDictionary (fn: (item: Item, index: any) => [any, any]): Collection<Item> {
        const collection: GenericObj = {}

        this.items.forEach((item, k) => {
            const [key, value] = fn(item, k)

            if (collection[key] === undefined) {
                collection[key] = [value]
            } else {
                collection[key].push(value)
            }
        })

        return new Collection<Item>(collection)
    }

    /**
     * The mapToGroups method iterates through the collection and passes each value to the given callback.
     */
    mapToGroups (fn: (item: Item, key: string | number) => [any, any]): Collection<any> {
        const collection: GenericObj = {}

        this.items.forEach((item, key) => {
            const [keyed, value] = fn(item, key)

            if (collection[keyed] === undefined) {
                collection[keyed] = [value]
            } else {
                collection[keyed].push(value)
            }
        })

        return new Collection(collection)
    }


    /**
     * The mapWithKeys method iterates through the collection and passes each value to the given callback.
     * The callback should return an array where the first element represents the key
     * and the second element represents the value pair.
     */
    mapWithKeys<T = Item> (fn: (item: Item, index: number | string) => [string, any]): Collection<T> {
        const collection: GenericObj = {}

        if (Array.isArray(this.items)) {
            this.items.forEach((item, index) => {
                const [keyed, value] = fn(item, index)
                collection[keyed] = value
            })
        } else {
            Object.keys(this.items).forEach((key) => {
                const [keyed, value] = fn(this.items[key as never], key)
                collection[keyed] = value
            })
        }

        return new Collection(collection)
    }


    /**
     * The max method returns the maximum value of a given key.
     */
    max (key?: keyof Item | string): number {
        if (typeof key === 'string') {
            const filtered = this.items.filter(item => item[key as never] !== undefined)

            return Math.max(...filtered.map(item => item[key as never]))
        }

        return Math.max(...this.items as any)
    }


    /**
     * The median method returns the median value of a given key.
     */
    median<K = Item> (key?: keyof Item | K): number {
        const { length } = this.items

        if (key === undefined) {
            if (length % 2 === 0) {
                return (this.items[(length / 2) - 1] as never + this.items[length / 2] as never) / 2
            }

            return this.items[Math.floor(length / 2)] as never
        }

        if (length % 2 === 0) {
            return (this.items[(length / 2) - 1][key as never] + this.items[length / 2][key as never]) / 2
        }

        return this.items[Math.floor(length / 2)][key as never]
    }

    /**
     * The merge method merges the given object into the original collection.
     * If a key in the given object matches a key in the original collection,
     * the given objects value will overwrite the value in the original collection.
     * 
     * @param value 
     * @returns 
     */
    merge<T = Item> (value: GenericObj | T[]): Collection<T> {
        let arrayOrObject: GenericObj = value

        if (typeof arrayOrObject === 'string') {
            arrayOrObject = [arrayOrObject]
        }

        if (Array.isArray(this.items) && Array.isArray(arrayOrObject)) {
            return new Collection(this.items.concat(arrayOrObject)) as never
        }

        const collection = JSON.parse(JSON.stringify(this.items))

        Object.keys(arrayOrObject).forEach((key) => {
            collection[key] = arrayOrObject[key]
        })

        return new Collection<T>(collection)
    }

    /**
     * The mergeRecursive method recursively merges the given object into the original collection.
     * If a key in the given object matches a key in the original collection,
     * the given objects value will overwrite the value in the original collection.
     * 
     * @param items 
     * @returns 
     */
    mergeRecursive (items: GenericObj | Collection): Collection<Item> {
        const merge = (target: GenericObj, source: GenericObj) => {
            const merged: GenericObj = {}

            const mergedKeys = Object.keys({ ...target, ...source })

            mergedKeys.forEach((key) => {
                if (target[key] === undefined && source[key] !== undefined) {
                    merged[key] = source[key]
                } else if (target[key] !== undefined && source[key] === undefined) {
                    merged[key] = target[key]
                } else if (target[key] !== undefined && source[key] !== undefined) {
                    if (target[key] === source[key]) {
                        merged[key] = target[key]
                    } else if (
                        (!Array.isArray(target[key]) && typeof target[key] === 'object')
                        && (!Array.isArray(source[key]) && typeof source[key] === 'object')
                    ) {
                        merged[key] = merge(target[key], source[key])
                    } else {
                        merged[key] = [].concat(target[key], source[key])
                    }
                }
            })

            return merged
        }

        if (!items) {
            return this
        }

        if (items instanceof Collection) {
            return new Collection(merge(this.items, items.all()))
        }

        return new Collection(merge(this.items, items))
    }


    /**
     * The min method returns the minimum value of a given key.
     */
    min<K = Item> (key?: keyof Item | K): number {
        if (typeof key !== 'undefined') {
            const filtered = this.items.filter(item => item[key as never] !== undefined)

            return Math.min(...filtered.map(item => item[key as never]))
        }

        return Math.min(...this.items as any)
    }


    /**
     * The mode method returns the mode value of a given key.
     */
    mode<K = Item> (key?: keyof Item | K): Item[] | null {
        const values: any[] = []
        let highestCount = 1

        if (!this.items.length) {
            return null
        }

        this.items.forEach((item) => {
            const tempValues = values.filter((value) => {
                if (key !== undefined) {
                    return value.key === item[key as never]
                }

                return value.key === item
            })

            if (!tempValues.length) {
                if (key !== undefined) {
                    values.push({ key: item[key as never], count: 1 })
                } else {
                    values.push({ key: item, count: 1 })
                }
            } else {
                tempValues[0].count += 1
                const { count } = tempValues[0]

                if (count > highestCount) {
                    highestCount = count
                }
            }
        })

        return values
            .filter(value => value.count === highestCount)
            .map(value => value.key)
    }


    /**
     * The nth method creates a new collection consisting of every n-th element.
     */
    nth (n: number, offset?: number): Collection<Item> {
        const items = getValues(this.items)

        const collection = items
            .slice(offset)
            .filter((_, index) => index % n === 0)

        return new Collection(collection)
    }

    /**
     * The only method returns the items in the collection with the specified keys.
     */
    only<K = Item> (...args: K[]): Collection<Item> {
        const properties = variadic(args)

        if (Array.isArray(this.items)) {
            const collection = this.items
                .filter(item => properties.indexOf(item) !== -1)

            return new Collection(collection)
        }

        const collection: GenericObj = {}

        Object.keys(this.items).forEach((prop) => {
            if (properties.indexOf(prop) !== -1) {
                collection[prop] = this.items[prop as never]
            }
        })

        return new Collection(collection)
    }

    /**
     * 
     * @param size 
     * @param value 
     * @returns 
     */
    pad (size: number, value: number): Collection<Item> {
        const abs = Math.abs(size)
        const count = this.count()

        if (abs <= count) {
            return this
        }

        let diff = abs - count
        const items = clone(this.items) as Item[]
        const isArray = Array.isArray(this.items)
        const prepend = size < 0

        for (let iterator = 0; iterator < diff;) {
            if (!isArray) {
                if (typeof items[iterator] !== 'undefined') {
                    diff += 1
                } else {
                    items[iterator] = value as never
                }
            } else if (prepend) {
                items.unshift(value as never)
            } else {
                items.push(value as never)
            }

            iterator += 1
        }

        return new Collection<Item>(items)
    }


    /**
     * The partition method may be combined with destructuring to separate elements
     * that pass a given truth test from those that do not.
     */
    partition<T = Item> (fn: (item: Item) => boolean):
        T extends any[]
        ? Collection<Collection<T>>
        : T extends Record<string, any>
        ? Collection<Collection<Record<string, T>>>
        : Collection<Collection<T>
        > {
        let arrays: [Collection<Item>, Collection<Item>]

        if (Array.isArray(this.items)) {
            arrays = [new Collection<Item>([]), new Collection<Item>([])]

            this.items.forEach((item) => {
                if (fn(item) === true) {
                    arrays[0].push(item)
                } else {
                    arrays[1].push(item)
                }
            })
        } else {
            arrays = [new Collection<Item>({}), new Collection<Item>({})]

            Object.keys(this.items).forEach((prop) => {
                const value = this.items[prop as never]

                if (fn(value) === true) {
                    arrays[0].put(prop, value)
                } else {
                    arrays[1].put(prop, value)
                }
            })
        }

        return new Collection(arrays) as never
    }


    /**
     * The pipe method passes the collection to the given callback and returns the result.
     */
    pipe<U> (fn: (...any: any[]) => U): U {
        return fn(this)
    }

    /**
     * The pluck method retrieves all of the values for a given key.
     */
    pluck<K, V, T = Item> (value: keyof Item | V, key?: keyof K): Collection<T> {
        if ((value as string).indexOf('*') !== -1) {
            const keyPathMap = buildKeyPathMap(this.items as never)

            const keyMatches: any[] = []

            if (key !== undefined) {
                const keyRegex = new RegExp(`0.${String(key)}`, 'g')
                const keyNumberOfLevels = `0.${String(key)}`.split('.').length

                Object.keys(keyPathMap).forEach((k) => {
                    const matchingKey = k.match(keyRegex)

                    if (matchingKey) {
                        const match = matchingKey[0]

                        if (match.split('.').length === keyNumberOfLevels) {
                            keyMatches.push(keyPathMap[match])
                        }
                    }
                })
            }

            const valueMatches: any[] = []
            const valueRegex = new RegExp(`0.${value}`, 'g')
            const valueNumberOfLevels = `0.${value}`.split('.').length


            Object.keys(keyPathMap).forEach((k) => {
                const matchingValue = k.match(valueRegex)

                if (matchingValue) {
                    const match = matchingValue[0]

                    if (match.split('.').length === valueNumberOfLevels) {
                        valueMatches.push(keyPathMap[match])
                    }
                }
            })

            if (key !== undefined) {
                const collection: GenericObj = {}

                this.items.forEach((item, index) => {
                    collection[keyMatches[index as number] || ''] = valueMatches
                })

                return new Collection(collection) as never
            }

            return new Collection([valueMatches]) as never
        }

        if (key !== undefined) {
            const collection: GenericObj = {}

            this.items.forEach((item) => {
                if (nestedValue(item, value) !== undefined) {
                    collection[item[key as never] || ''] = nestedValue(item, value)
                } else {
                    collection[item[key as never] || ''] = null
                }
            })

            return new Collection<Item>(collection) as never
        }

        return this.map((item) => {
            if (nestedValue(item, value) !== undefined) {
                return nestedValue(item, value)
            }

            return null
        })
    }

    /**
     * The pop method removes and returns the last item from the collection.
     */
    pop (count: number = 1): Item | Collection<Item> | undefined {
        if (this.isEmpty()) {
            return undefined
        }

        if (isArray(this.items)) {
            if (count === 1) {
                return this.items.pop()
            }

            return new Collection(this.items.splice(-count))
        }

        if (isObject(this.items)) {
            const keys = Object.keys(this.items)

            if (count === 1) {
                const key = keys[keys.length - 1]
                const last = this.items[key as never]

                deleteKeys(this.items, key)

                return last
            }

            const poppedKeys = keys.slice(-count)

            const newObject = poppedKeys.reduce((acc, current) => {
                acc[current] = this.items[current as never]

                return acc
            }, {} as GenericObj)

            deleteKeys(this.items, poppedKeys)

            return new Collection(newObject)
        }

        return undefined
    }

    /**
     * The prepend method adds an item to the beginning of the collection.
     */
    prepend<V, K = Item> (value: V, key?: K): this {
        if (typeof key !== 'undefined') {
            return this.put(key, value)
        }

        this.items.unshift(value as never)

        return this
    }

    /**
     * The pull method removes and returns an item from the collection by its key.
     */
    pull<K = Item> (key: keyof Item | K, defaultValue?: any): Item | null {
        let returnValue = this.items[key as never] || null

        if (!returnValue && typeof defaultValue !== 'undefined') {
            if (isFunction(defaultValue)) {
                returnValue = defaultValue() as never
            } else {
                returnValue = defaultValue as never
            }
        }

        delete this.items[key as never]

        return returnValue
    }


    /**
     * The push method appends an item to the end of the collection.
     */
    push (...items: Item[]): this {
        this.items.push(...items)

        return this
    }

    /**
     * The put method sets the given key and value in the collection.
     */
    put<V, K = Item> (key: K, value: V): this {
        this.items[key as never] = value as never

        return this
    }

    /**
     * The random method returns a random item from the collection.
     */
    random (length?: number | string): Collection<Item> {
        const items = getValues(this.items)

        const collection = new Collection(items).shuffle()

        // If not a length was specified
        if (!length || length !== parseInt(String(length), 10)) {
            return collection.first() as never
        }

        return collection.take(length)
    }

    /**
     * The reduce method reduces the collection to a single value,
     * passing the result of each iteration into the subsequent iteration.
     */
    reduce<T = Item> (fn: (_carry?: T | null, item?: Item, index?: number | string) => T, carry?: T): any {
        let reduceCarry: T | null | undefined = null

        if (typeof carry !== 'undefined') {
            reduceCarry = carry
        }

        if (Array.isArray(this.items)) {
            this.items.forEach((item, index) => {
                reduceCarry = fn(reduceCarry, item, index)
            })
        } else {
            Object.keys(this.items).forEach((key) => {
                reduceCarry = fn(reduceCarry, this.items[key as never], key)
            })
        }

        return reduceCarry
    }

    /**
     * The reject method filters the collection using the given callback.
     * The callback should return true if the item should be removed from the resulting collection.
     */
    reject (fn: (item: Item) => boolean): Collection<Item> {
        return new Collection(this.items).filter(item => !fn(item))
    }

    /**
     * the replace method will replace matching properties in the collection
     * 
     * @param items 
     * @returns 
     */
    replace (items?: Item[] | Collection<Item> | GenericObj) {
        if (!items) {
            return this
        }

        if (Array.isArray(items)) {
            const replaced = this.items.map((value, index) => items[index] || value)

            return new Collection(replaced)
        }

        if (items instanceof Collection) {
            const replaced = { ...this.items, ...items.all() }

            return new Collection(replaced)
        }

        const replaced = { ...this.items, ...items }

        return new Collection(replaced)
    }

    /**
     * the replaceRecursive method will recursively replace matching properties in the collection
     * 
     * @param items 
     * @returns 
     */
    replaceRecursive (items: Item[] | Collection | GenericObj): Collection<Item> {

        const replace = (target: GenericObj, source: GenericObj) => {
            const replaced = { ...target }

            const mergedKeys = Object.keys({ ...target, ...source })

            mergedKeys.forEach((key) => {
                if (!Array.isArray(source[key]) && typeof source[key] === 'object') {
                    replaced[key] = replace(target[key], source[key])
                } else if (target[key] === undefined && source[key] !== undefined) {
                    if (typeof target[key] === 'object') {
                        replaced[key] = { ...source[key] }
                    } else {
                        replaced[key] = source[key]
                    }
                } else if (target[key] !== undefined && source[key] === undefined) {
                    if (typeof target[key] === 'object') {
                        replaced[key] = { ...target[key] }
                    } else {
                        replaced[key] = target[key]
                    }
                } else if (target[key] !== undefined && source[key] !== undefined) {
                    if (typeof source[key] === 'object') {
                        replaced[key] = { ...source[key] }
                    } else {
                        replaced[key] = source[key]
                    }
                }
            })

            return replaced
        }

        if (!items) {
            return this
        }

        if (!Array.isArray(items) && typeof items !== 'object') {
            return new Collection<Item>(replace(this.items, [items]))
        }

        if (items instanceof Collection) {
            return new Collection<Item>(replace(this.items, items.all()))
        }

        return new Collection<Item>(replace(this.items, items))
    }


    /**
     * The reverse method reverses the order of the collection's items.
     */
    reverse (): Collection<Item> {
        const collection = Array.isArray(this.items)
            ? ([] as Item[]).concat(this.items).reverse()
            : Object.fromEntries(Object.entries(this.items).reverse())

        return new Collection(collection) as never
    }


    /**
     * The search method searches the collection for the given value and returns its key if found.
     * If the item is not found, false is returned.
     */
    search (valueOrFunction: Item | ((value: Item, key: number) => boolean), strict?: boolean): any {
        let result: number | undefined = undefined

        const find = (_: any, key: number) => {
            if (isFunction(valueOrFunction)) {
                return valueOrFunction(this.items[key as never], key)
            }

            if (strict) {
                return this.items[key as never] === valueOrFunction
            }

            return this.items[key as never] == valueOrFunction
        }

        if (isArray(this.items)) {
            result = this.items.findIndex(find)
        } else if (isObject(this.items)) {
            result = Object.keys(this.items).find(key => find(this.items[key as never], key as never)) as never
        }

        if (typeof result === 'undefined' || result < 0) {
            return false
        }

        return result
    }

    /**
     * The shift method removes and returns the first item from the collection.
     */
    shift (count = 1): Collection<Item> | undefined {
        if (this.isEmpty()) {
            return undefined
        }

        if (isArray(this.items)) {
            if (count === 1) {
                return this.items.shift() as never
            }

            return new Collection<Item>(this.items.splice(0, count))
        }

        if (isObject(this.items)) {
            if (count === 1) {
                const key = Object.keys(this.items)[0]
                const value = this.items[key as never]
                delete this.items[key as never]

                return value as never
            }

            const keys = Object.keys(this.items)
            const poppedKeys = keys.slice(0, count)

            const newObject = poppedKeys.reduce((acc, current) => {
                acc[current] = this.items[current as never]

                return acc
            }, {} as GenericObj)

            deleteKeys(this.items, poppedKeys)

            return new Collection<Item>(newObject)
        }

        return undefined
    }


    /**
     * The shuffle method randomly shuffles the items in the collection.
     */
    shuffle (): this {
        const items = getValues(this.items)

        let j
        let x
        let i

        for (i = items.length; i; i -= 1) {
            j = Math.floor(Math.random() * i)
            x = items[i - 1]
            items[i - 1] = items[j]
            items[j] = x
        }

        this.items = items

        return this
    }

    /**
     * 
     * @param number 
     * @returns 
     */
    skip (number: number): Collection<Item> {
        if (isObject(this.items)) {
            return new Collection<Item>(
                Object.keys(this.items)
                    .reduce((accumulator, key, index) => {
                        if ((index + 1) > number) {
                            accumulator[key] = this.items[key as never]
                        }

                        return accumulator
                    }, {} as GenericObj),
            )
        }

        return new Collection<Item>(this.items.slice(number))
    }

    /**
     * 
     * @param valueOrFunction 
     * @returns 
     */
    skipUntil<K = Item> (valueOrFunction: Item | K | ((value: Item) => boolean)): Collection<Item> {
        let previous: boolean | null = null
        let items

        let callback: (v: Item) => any = value => value === valueOrFunction

        if (isFunction(valueOrFunction)) {
            callback = valueOrFunction
        }

        if (isArray(this.items)) {
            items = this.items.filter((item) => {
                if (previous !== true) {
                    previous = callback(item)
                }

                return previous
            })
        }

        if (isObject(this.items)) {
            items = Object.keys(this.items).reduce((acc, key) => {
                if (previous !== true) {
                    previous = callback(this.items[key as never])
                }

                if (previous !== false) {
                    acc[key] = this.items[key as never]
                }

                return acc
            }, {} as GenericObj)
        }

        return new Collection<Item>(items)
    }

    /**
     * 
     * @param valueOrFunction 
     * @returns 
     */
    skipWhile (valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item> {
        let previous: boolean | null = null
        let items

        let callback: (v: Item) => any = value => value === valueOrFunction

        if (isFunction(valueOrFunction)) {
            callback = valueOrFunction
        }

        if (isArray(this.items)) {
            items = this.items.filter((item) => {
                if (previous !== true) {
                    previous = !callback(item)
                }

                return previous
            })
        }

        if (isObject(this.items)) {
            items = Object.keys(this.items).reduce((acc, key) => {
                if (previous !== true) {
                    previous = !callback(this.items[key as never])
                }

                if (previous !== false) {
                    acc[key] = this.items[key as never]
                }

                return acc
            }, {} as GenericObj)
        }

        return new Collection<Item>(items)
    }

    /**
     * The slice method returns a slice of the collection starting at the given index.
     */
    slice (remove: number, limit?: number): Collection<Item> {
        let collection = this.items.slice(remove)

        if (typeof limit !== 'undefined') {
            collection = collection.slice(0, limit)
        }

        return new Collection(collection)
    }

    sole<V, K = Item> (key?: keyof Item | K | ((val: Item) => any), operator?: Operator | K, value?: V) {
        let collection

        if (isFunction(key)) {
            collection = this.filter(key)
        } else {
            collection = this.where(key, operator, value)
        }

        if (collection.isEmpty()) {
            throw new Error('Item not found.')
        }

        if (collection.count() > 1) {
            throw new Error('Multiple items found.')
        }

        return collection.first()
    }

    /**
     * The some method determines whether the collection contains a given item.
     * 
     * @param key 
     * @param value 
     * @alias contains
     * @returns 
     */
    some<V> (key: keyof Item | ((...args: any[]) => any), value?: V): boolean {
        return this.contains(key, value)
    }

    /**
     * The sort method sorts the collection.
     */
    sort (fn?: (a: Item, b: Item) => number): Collection<Item> {
        const collection = [].concat(this.items as never)

        if (typeof fn === 'undefined') {
            if (this.every(item => typeof item === 'number')) {
                collection.sort((a, b) => a - b)
            } else {
                collection.sort()
            }
        } else {
            collection.sort(fn)
        }

        return new Collection<Item>(collection)
    }

    /**
     * The sortBy method sorts the collection by the given key.
     * The sorted collection keeps the original array keys.
     */
    sortBy<V> (value: V): Collection<Item>
    /**
     * The sortBy method sorts the collection by the given callback.
     * The sorted collection keeps the original array keys.
     */
    sortBy (fn: (item: Item) => number): Collection<Item>
    /**
     * The sortByMany method sorts the collection by the given keys.
     * The sorted collection keeps the original array keys.
     */
    sortBy<V> (keys: V[]): Collection<Item>
    /**
     * The sortByMany method sorts the collection by the given callbacks.
     * The sorted collection keeps the original array keys.
     */
    sortBy (fns: ((item: Item) => number)[]): Collection<Item>
    /**
     * The sortBy method sorts the collection by the given callback.
     * The sorted collection keeps the original array keys.
     */
    sortBy (fn: (item: Item) => number): Collection<Item>
    sortBy<V> (key: V[] | ((item: Item) => number)): Collection<Item>
    sortBy<V> (key: V[] | ((item: Item) => number)): Collection<Item> {
        if (isArray(key)) {
            return this.sortByMany(key)
        }

        const collection = [].concat(this.items as never)
        const getValue = (item: never) => {
            if (isFunction(key)) {
                return key(item)
            }

            return nestedValue(item, key)
        }

        collection.sort((a, b) => {
            const valueA = getValue(a)
            const valueB = getValue(b)

            if (valueA === null || valueA === undefined) {
                return 1
            }
            if (valueB === null || valueB === undefined) {
                return -1
            }

            if (valueA < valueB) {
                return -1
            }
            if (valueA > valueB) {
                return 1
            }

            return 0
        })

        return new Collection<Item>(collection)
    }

    /**
     * This method has the same signature as the sortBy method,
     * but will sort the collection in the opposite order.
     */
    sortByDesc<V> (value: V): Collection<Item>
    /**
     * This method has the same signature as the sortBy method,
     * but will sort the collection in the opposite order.
     */
    sortByDesc (fn: (item: Item) => number): Collection<Item>
    sortByDesc (fn: (item: Item) => number): Collection<Item> {
        return this.sortBy(fn).reverse()
    }

    /**
     * The sortByMany method sorts the collection by the given callbacks.
     * The sorted collection keeps the original array keys.
     */
    sortByMany<V> (value: (V | (() => any))[]): Collection<Item> {
        const getValue = (item: any, valueOrFunction: any) => {
            if (isFunction(valueOrFunction)) {
                return valueOrFunction(item)
            }

            return nestedValue(item, valueOrFunction)
        }


        const collection = [].concat(this.items as never)

        collection.sort((a, b) => {
            for (let index = 0; index < value.length; index += 1) {
                const criteria = value[index]

                const valueA = getValue(a, criteria)
                const valueB = getValue(b, criteria)

                if (valueA === null || valueA === undefined) {
                    return 1
                }
                if (valueB === null || valueB === undefined) {
                    return -1
                }

                if (valueA < valueB) {
                    return -1
                }
                if (valueA > valueB) {
                    return 1
                }
            }

            return 0
        })

        return new Collection<Item>(collection)
    }

    /**
     * 
     * @returns 
     */
    sortDesc () {
        return this.sort().reverse()
    }

    sortKeys (): Collection<Item> {
        const ordered: GenericObj = {}

        Object.keys(this.items).sort().forEach((key) => {
            ordered[key] = this.items[key as never]
        })

        return new Collection<Item>(ordered)
    }

    /**
     * 
     * @returns 
     */
    sortKeysDesc (): Collection<Item> {
        const ordered: GenericObj = {}

        Object.keys(this.items).sort().reverse().forEach((key) => {
            ordered[key] = this.items[key as never]
        })

        return new Collection<Item>(ordered)
    }

    /**
     * The splice method removes and returns a slice of items starting at the specified index.
     * You may pass a second argument to limit the size of the resulting chunk.
     */
    splice (index: number, limit: number, replace?: Item[]): Collection<Item> {
        const slicedCollection = this.slice(index, limit)

        this.items = this.diff(slicedCollection.all() as never).all() as never

        if (Array.isArray(replace)) {
            for (let iterator = 0, { length } = replace;
                iterator < length; iterator += 1) {
                this.items.splice(index + iterator, 0, replace[iterator])
            }
        }

        return slicedCollection
    }


    /**
     * The split method breaks a collection into the given number of groups.
     */
    split (numberOfGroups: number): Collection {
        const itemsPerGroup = Math.round(this.items.length as number / numberOfGroups)

        const items = JSON.parse(JSON.stringify(this.items))
        const collection = []

        for (let iterator = 0; iterator < numberOfGroups; iterator += 1) {
            collection.push(new Collection(items.splice(0, itemsPerGroup)))
        }

        return new Collection(collection)
    }

    /**
     * The sum method returns the sum of all items in the collection.
     */
    sum<K = Item> (key?: keyof Item | K | ((item: Item) => number | string)): number {
        const items = getValues(this.items)

        let total = 0

        if (key === undefined) {
            for (let i = 0, { length } = items; i < length; i += 1) {
                total += parseFloat(items[i])
            }
        } else if (isFunction(key)) {
            for (let i = 0, { length } = items; i < length; i += 1) {
                total += parseFloat(String(key(items[i])))
            }
        } else {
            for (let i = 0, { length } = items; i < length; i += 1) {
                total += parseFloat(items[i][key])
            }
        }


        return parseFloat(total.toPrecision(12))
    }

    /**
     * The take method returns a new collection with the specified number of items:
     * You may also pass a negative integer to take the specified amount of items from the end of the collection.
     */
    take (length: number): Collection<Item> {
        if (!Array.isArray(this.items) && typeof this.items === 'object') {
            const keys = Object.keys(this.items)
            let slicedKeys

            if (length < 0) {
                slicedKeys = keys.slice(length)
            } else {
                slicedKeys = keys.slice(0, length)
            }

            const collection: GenericObj = {}

            keys.forEach((prop) => {
                if (slicedKeys.indexOf(prop) !== -1) {
                    collection[prop] = this.items[prop as never]
                }
            })

            return new Collection(collection)
        }

        if (length < 0) {
            return new Collection(this.items.slice(length))
        }

        return new Collection(this.items.slice(0, length))
    }

    /**
     * 
     * @param valueOrFunction 
     * @returns 
     */
    takeUntil (valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item> {
        let previous: boolean | null = null
        let items

        let callback: (v: Item) => any = value => value === valueOrFunction

        if (isFunction(valueOrFunction)) {
            callback = valueOrFunction
        }

        if (isArray(this.items)) {
            items = this.items.filter((item) => {
                if (previous !== false) {
                    previous = !callback(item)
                }

                return previous
            })
        }

        if (isObject(this.items)) {
            items = Object.keys(this.items).reduce((acc, key) => {
                if (previous !== false) {
                    previous = !callback(this.items[key as never])
                }

                if (previous !== false) {
                    acc[key] = this.items[key as never]
                }

                return acc
            }, {} as GenericObj)
        }

        return new Collection<Item>(items)
    }


    /**
     * 
     * @param valueOrFunction 
     * @returns 
     */
    takeWhile (valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item> {
        let previous: boolean | null = null
        let items

        let callback: (v: Item) => any = value => value === valueOrFunction

        if (isFunction(valueOrFunction)) {
            callback = valueOrFunction
        }

        if (isArray(this.items)) {
            items = this.items.filter((item) => {
                if (previous !== false) {
                    previous = callback(item)
                }

                return previous
            })
        }

        if (isObject(this.items)) {
            items = Object.keys(this.items).reduce((acc, key) => {
                if (previous !== false) {
                    previous = callback(this.items[key as never])
                }

                if (previous !== false) {
                    acc[key] = this.items[key as never]
                }

                return acc
            }, {} as GenericObj)
        }

        return new Collection<Item>(items)
    }


    /**
     * The tap method passes the collection to the given callback,
     * allowing you to "tap" into the collection at a specific point
     * and do something with the items while not affecting the collection itself.
     */
    tap (fn: (collection: Collection<Item>) => void): this {
        fn(this)

        return this
    }

    /**
     * The times method creates a new collection by invoking the callback a given amount of times.
     */
    times (times: number, fn: (time: number) => any): this {
        for (let iterator = 1; iterator <= times; iterator += 1) {
            this.items.push(fn(iterator))
        }

        return this
    }

    /**
     * The toArray method converts the collection into a plain array.
     * If the collection is an object, an array containing the values will be returned.
     */
    toArray (): Item[] {
        function iterate (list: Collection | any[], collection: any[]) {
            const childCollection: any[] = []

            if (list instanceof Collection) {
                list.items.forEach((i: Collection | any[]) => iterate(i, childCollection))
                collection.push(childCollection)
            } else if (Array.isArray(list)) {
                list.forEach(i => iterate(i, childCollection))
                collection.push(childCollection)
            } else {
                collection.push(list)
            }
        }

        if (Array.isArray(this.items)) {
            const collection: any[] = []

            this.items.forEach((items: any) => {
                iterate(items, collection)
            })

            return collection
        }

        return this.values().all() as never
    }


    /**
     * The toJson method converts the collection into JSON string.
     */
    toJson (): string {
        if (typeof this.items === 'object' && !Array.isArray(this.items)) {
            return JSON.stringify(this.all())
        }

        return JSON.stringify(this.toArray())
    }

    protected toJSON () {
        return this.items
    }

    /**
     * The transform method iterates over the collection and calls the given callback with each item in the collection.
     * The items in the collection will be replaced by the values returned by the callback.
     */
    transform<T = Item> (fn: (item: Item, key?: number) => T): this {
        if (Array.isArray(this.items)) {
            this.items = this.items.map(fn) as never
        } else {
            const collection: GenericObj = {}

            Object.keys(this.items).forEach((key) => {
                collection[key] = fn(this.items[key as never], key as never)
            })

            this.items = collection as never
        }

        return this
    }


    /**
     * The union method adds the given array to the collection.
     * If the given array contains keys that are already in the original collection,
     * the original collection's values will be preferred.
     */
    union<T = Item> (object: GenericObj): Collection<T> {
        const collection: GenericObj = JSON.parse(JSON.stringify(this.items))

        Object.keys(object).forEach((prop) => {
            if (this.items[prop as never] === undefined) {
                collection[prop] = object[prop]
            }
        })

        return new Collection(collection)
    }


    /**
     * The unique method returns all of the unique items in the collection.
     */
    unique<K = Item> (key?: keyof Item | K | ((...args: any[]) => any)): Collection<Item> {
        let collection: Collection<Item> | Item[]

        if (key === undefined) {
            collection = this.items
                .filter((element, index, self) => self.indexOf(element) === index)
        } else {
            collection = []

            const usedKeys = []

            for (let iterator = 0, { length } = this.items; iterator < (length as number); iterator += 1) {
                let uniqueKey
                if (isFunction(key)) {
                    uniqueKey = key(this.items[iterator as never])
                } else {
                    uniqueKey = this.items[iterator as never][key as never]
                }

                if (usedKeys.indexOf(uniqueKey) === -1) {
                    collection.push(this.items[iterator as never])
                    usedKeys.push(uniqueKey)
                }
            }
        }

        return new Collection<Item>(collection as never)
    }


    /**
     * The unless method will execute the given callback when the first argument given to the method evaluates to false.
     */
    unless (
        condition: boolean,
        fn: (collection: Collection<Item>) => Collection<Item>,
        defaultFn?: (collection: Collection<Item>) => Collection<Item>
    ): Collection<Item> {
        if (!condition) {
            return fn(this)
        } else if (defaultFn) {
            return defaultFn(this)
        }

        return this
    }

    /**
     * The unwrap method will unwrap the given collection.
     */
    unwrap<T = Item> (value: T[] | Collection<T>): T[] {
        if (value instanceof Collection) {
            return value.all() as never
        }

        return value
    }

    /**
     * The values method returns a new collection with the keys reset to consecutive integers.
     */
    values<T = Item> (): Collection<T> {
        return new Collection(getValues(this.items))
    }

    /**
     * 
     * @returns 
     */
    undot (): Collection<Item> {
        if (Array.isArray(this.items)) {
            return this
        }

        let collection: GenericObj = {}

        Object.keys(this.items).forEach((key) => {
            if (key.indexOf('.') !== -1) {
                const obj = collection

                key.split('.').reduce((acc, current, index, array) => {
                    if (!acc[current]) {
                        acc[current] = {}
                    }

                    if ((index === array.length - 1)) {
                        acc[current] = this.items[key as never]
                    }

                    return acc[current]
                }, obj)

                collection = { ...collection, ...obj }
            } else {
                collection[key] = this.items[key as never]
            }
        })

        return new Collection<Item>(collection)
    }

    /**
     * Run the given callback if the result is empty
     * @param fn 
     * @param defaultFn 
     * @alias whenEmpty
     * 
     * @returns 
     */
    unlessEmpty (
        fn: (collection: Collection<Item>) => Collection<Item>,
        defaultFn?: (collection: Collection<Item>) => Collection<Item>
    ) {
        return this.whenNotEmpty(fn, defaultFn)
    }

    /**
     * Run the given callback if the result is empty
     * @param fn 
     * @param defaultFn 
     * @alias whenEmpty
     * 
     * @returns 
     */
    unlessNotEmpty (
        fn: (collection: Collection<Item>) => Collection<Item>,
        defaultFn?: (collection: Collection<Item>) => Collection<Item>
    ) {
        return this.whenEmpty(fn, defaultFn)
    }

    /**
     * The when method will execute the given callback when the first argument given to the method evaluates to true.
     */
    when (
        condition: boolean,
        fn: (collection: Collection<Item>, condition?: boolean) => Collection<Item> | void | undefined,
        defaultFn?: (collection: Collection<Item>, condition?: boolean) => Collection<Item> | void | undefined
    ): Collection<Item> {
        if (condition) {
            return fn(this, condition) ?? this
        }

        if (defaultFn) {
            return defaultFn(this, condition) ?? this
        }

        return this
    }

    /**
     * Run the given callback if the result is empty
     * @param fn 
     * @param defaultFn 
     * @returns 
     */
    whenEmpty (
        fn: (collection: Collection<Item>) => Collection<Item>,
        defaultFn?: (collection: Collection<Item>) => Collection<Item>
    ) {
        if (Array.isArray(this.items) && !this.items.length) {
            return fn(this)
        } if (!Object.keys(this.items).length) {
            return fn(this)
        }

        if (defaultFn !== undefined) {
            if (Array.isArray(this.items) && this.items.length) {
                return defaultFn(this)
            } if (Object.keys(this.items).length) {
                return defaultFn(this)
            }
        }

        return this
    }

    /**
     * Run the given callback if the result is not empty
     * @param fn 
     * @param defaultFn 
     * @returns 
     */
    whenNotEmpty (
        fn: (collection: Collection<Item>) => Collection<Item>,
        defaultFn?: (collection: Collection<Item>) => Collection<Item>
    ) {
        if (Array.isArray(this.items) && this.items.length) {
            return fn(this)
        } if (Object.keys(this.items).length) {
            return fn(this)
        }

        if (defaultFn !== undefined) {
            if (Array.isArray(this.items) && !this.items.length) {
                return defaultFn(this)
            } if (!Object.keys(this.items).length) {
                return defaultFn(this)
            }
        }

        return this
    }

    /**
     * The where method filters the collection by a given key / value pair.
    */
    where<V, K = Item> (key: keyof Item | K, value: V): Collection<Item>
    where<V, K = Item> (key?: keyof Item | K, operator?: Operator | K, value?: V | null | undefined): Collection<Item>
    where<V, K = Item> (key?: keyof Item | K, operator?: Operator | K, value?: V | null | undefined): Collection<Item> {
        let comparisonOperator = operator
        let comparisonValue: Operator | V | K = value!

        const items = getValues(this.items)

        if (key === undefined && operator === undefined) {
            return new Collection(items.filter(item => !!item))
        }

        if (operator === undefined || operator === true) {
            return new Collection(items.filter(item => nestedValue(item, String(key))))
        }

        if (operator === false) {
            return new Collection(items.filter(item => !nestedValue(item, String(key))))
        }

        if (value === undefined) {
            comparisonValue = operator
            comparisonOperator = '==='
        }

        const collection = items.filter((item) => {
            switch (comparisonOperator) {
                case '==':
                    return nestedValue(item, String(key)) === Number(comparisonValue)
                        || nestedValue(item, String(key)) == comparisonValue

                default:
                case '===':
                    return nestedValue(item, String(key)) === comparisonValue

                case '!=':
                case '<>':
                    return nestedValue(item, String(key)) !== Number(comparisonValue)
                        && nestedValue(item, String(key)) != comparisonValue

                case '!==':
                    return nestedValue(item, String(key)) !== comparisonValue

                case '<':
                    return nestedValue(item, String(key)) < comparisonValue

                case '<=':
                    return nestedValue(item, String(key)) <= comparisonValue

                case '>':
                    return nestedValue(item, String(key)) > comparisonValue

                case '>=':
                    return nestedValue(item, String(key)) >= comparisonValue
            }
        })

        return new Collection(collection)
    }

    /**
     * 
     * The whereBetween method filters the collection by a key value range.
     * 
     * @param key 
     * @param values 
     * @returns 
     */
    whereBetween<V, K = Item> (key: keyof Item | K, values: V[]): Collection<Item> {
        return this.where(key, '>=', values[0]).where(key, '<=', values[values.length - 1])
    }

    /**
     * The whereIn method filters the collection by a given key / value contained within the given array.
     */
    whereIn<V, K = Item> (key: keyof Item | K, values: V[]): Collection<Item> {
        const items = getValues(values)

        const collection = this.items
            .filter(item => items.indexOf(nestedValue(item, String(key))) !== -1)

        return new Collection(collection)
    }

    /**
     * 
     * @param type 
     * @returns 
     */
    whereInstanceOf (type: abstract new (...args: any[]) => any) {
        return this.filter(item => item instanceof type)
    }

    /**
     * 
     * The whereNotBetween method filters the collection by a given key / value not contained within the given arguements.
     * 
     * @param key 
     * @param values 
     * @returns 
     */
    whereNotBetween<V, K = Item> (key: keyof Item | K, values: V[]): Collection<Item> {
        return this.filter(item => (
            nestedValue(item, key as string) < values[0] || nestedValue(item, key as string) > values[values.length - 1]
        ))
    }

    /**
     * The whereNotIn method filters the collection by a given key / value not contained within the given array.
     */
    whereNotIn<V, K = Item> (key: keyof Item | K, values: V[]): Collection<Item> {
        const items = getValues(values)

        const collection = this.items
            .filter(item => items.indexOf(nestedValue(item, String(key))) === -1)

        return new Collection(collection)
    }

    /**
     * Filter only items in the collectino that do not have null values
     * 
     * @param key 
     * @returns 
     */
    whereNotNull (key?: keyof Item) {
        return this.where(key, '!==', null)
    }

    /**
     * The whereNull method filters items where the given key is null.
     * 
     * @param key 
     * @returns 
     */
    whereNull<K = Item> (key: keyof Item | K | null | undefined = null) {
        return this.where(key, '===', null)
    }

    /**
     * The wrap method will wrap the given value in a collection.
     */
    wrap<T = Item> (value: T | T[] | Collection<T>): Collection<T> {
        if (value instanceof Collection) {
            return value
        }

        if (typeof value === 'object') {
            return new Collection(value)
        }

        return new Collection([value])
    }

    /**
     * The zip method merges together the values of the given array with the values
     * of the original collection at the corresponding index.
     */
    zip<T = Item> (array: T[] | Collection): Collection<[Item, T]> {
        const items = Array.isArray(this.items) ? this.items : Object.values(this.items)
        let values = array

        if (values instanceof Collection) {
            values = values.all() as never
        }

        const collection = items.map((item, index) => new Collection([item, values[index as never]]))

        return new Collection<[Item, T]>(collection as never)
    }

    [Symbol.iterator] (): Iterator<Item> {
        let index = -1
        const items: any = this.items
        const length = Array.isArray(this.items) ? this.items.length : Object.keys(this.items).length

        return {
            next: () => {
                index += 1

                return {
                    value: items[index],
                    done: index >= length,
                }
            },
        }
    }
}

export const collect = <Item = any> (collection?: Record<string, Item> | Item[] | Item) => new Collection(collection)