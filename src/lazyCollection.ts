'use strict'

import { isFunction } from './utilities/is'

import { Collection } from './collection'
import getValues from './utilities/values'
import nestedValue from './utilities/nestedValue'

type Operator = '===' | '==' | '!==' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | boolean

/**
 * A producer is a re-runnable function that yields a fresh iterator every time
 * it is called. Everything a LazyCollection does is expressed as one of these,
 * which is what allows a lazy collection to be enumerated more than once.
 */
type Producer<Item> = () => Iterator<Item> | Iterable<Item>

type Source<Item> =
    | Item[]
    | Record<string, Item>
    | Iterable<Item>
    | Producer<Item>
    | Collection<Item>
    | LazyCollection<Item>

/**
 * The LazyCollection class is a generator-backed counterpart to Collection.
 *
 * Operations such as map, filter, take and takeUntil are only evaluated as
 * items are pulled from the underlying source, one at a time. This makes it
 * possible to work with very large — or even infinite — data sets while
 * keeping memory usage low, exactly like Laravel's LazyCollection.
 */
export class LazyCollection<Item = any> implements Iterable<Item> {
    /**
     * A thunk returning a fresh iterator over the source on every call.
     */
    private producer: () => Iterator<Item>

    constructor(source?: Source<Item> | Item) {
        this.producer = LazyCollection.normalize<Item>(source)
    }

    /**
     * The make method creates a new lazy collection instance from the given
     * source, which may be an array, object, iterable, Collection or — most
     * usefully — a generator function.
     * 
     * @param source 
     * @returns 
     */
    static make<T = any>(source?: Source<T> | T): LazyCollection<T> {
        return new LazyCollection<T>(source)
    }

    /**
     * Wrap the given value in a lazy collection if it is not one already.
     * 
     * @param value 
     * @returns 
     */
    static wrap<T = any>(value: T | T[] | Collection<T> | LazyCollection<T>): LazyCollection<T> {
        if (value instanceof LazyCollection) {
            return value
        }

        return new LazyCollection<T>(value as never)
    }

    /**
     * Turn any accepted source into a re-runnable iterator thunk.
     * 
     * @param source 
     * @returns 
     */
    private static normalize<T>(source: any): () => Iterator<T> {
        if (source === undefined || source === null) {
            return () => ([] as T[])[Symbol.iterator]()
        }

        if (source instanceof LazyCollection || source instanceof Collection) {
            return () => source[Symbol.iterator]()
        }

        if (isFunction(source)) {
            return () => {
                const result = source()

                if (result && typeof (result as any).next === 'function') {
                    return result as Iterator<T>
                }

                if (result && typeof (result as any)[Symbol.iterator] === 'function') {
                    return (result as Iterable<T>)[Symbol.iterator]()
                }

                return [result as T][Symbol.iterator]()
            }
        }

        if (Array.isArray(source)) {
            return () => (source as T[])[Symbol.iterator]()
        }

        if (typeof source === 'object') {
            if (typeof source[Symbol.iterator] === 'function') {
                return () => (source as Iterable<T>)[Symbol.iterator]()
            }

            return () => Object.values(source as Record<string, T>)[Symbol.iterator]()
        }

        return () => [source as T][Symbol.iterator]()
    }

    /**
     * Build a predicate from a value or a callback. When given a plain value the
     * predicate performs a strict equality check against it.
     * 
     * @param valueOrFunction 
     * @returns 
     */
    private static valueCallback<T>(valueOrFunction: T | ((value: T) => boolean)): (value: T) => boolean {
        if (isFunction(valueOrFunction)) {
            return valueOrFunction as (value: T) => boolean
        }

        return (value: T) => value === valueOrFunction
    }

    /**
     * Build a where predicate mirroring Collection#where, so the lazy where
     * family can filter item-by-item and keep short-circuiting.
     * 
     * @param key 
     * @param operator 
     * @param value 
     * @returns 
     */
    private static wherePredicate<T>(key?: any, operator?: any, value?: any): (item: T) => boolean {
        if (key === undefined && operator === undefined) {
            return (item: T) => Boolean(item)
        }

        if (operator === undefined || operator === true) {
            return (item: T) => Boolean(nestedValue(item, String(key)))
        }

        if (operator === false) {
            return (item: T) => !nestedValue(item, String(key))
        }

        let comparisonOperator = operator
        let comparisonValue = value

        if (value === undefined) {
            comparisonValue = operator
            comparisonOperator = '==='
        }

        return (item: T) => {
            const resolved = nestedValue(item, String(key))

            switch (comparisonOperator) {
                case '==':
                    return resolved === Number(comparisonValue) || resolved == comparisonValue
                default:
                case '===':
                    return resolved === comparisonValue
                case '!=':
                case '<>':
                    return resolved !== Number(comparisonValue) && resolved != comparisonValue
                case '!==':
                    return resolved !== comparisonValue
                case '<':
                    return resolved < comparisonValue
                case '<=':
                    return resolved <= comparisonValue
                case '>':
                    return resolved > comparisonValue
                case '>=':
                    return resolved >= comparisonValue
            }
        }
    }

    [Symbol.iterator](): Iterator<Item> {
        return this.producer()
    }

    /**
     * The map method lazily transforms each item using the given callback.
     * 
     * @param fn 
     * @returns 
     */
    map<T = Item>(fn: (item: Item, index: number) => T): LazyCollection<T> {
        const self = this

        return new LazyCollection<T>(function* () {
            let index = 0
            for (const item of self) {
                yield fn(item, index)
                index += 1
            }
        })
    }

    /**
     * The mapInto method lazily instantiates the given class for each item.
     * 
     * @param ClassName 
     * @returns 
     */
    mapInto<T extends new (...args: any[]) => any>(ClassName: T): LazyCollection<InstanceType<T>> {
        return this.map((value, index) => new ClassName(value, index))
    }

    /**
     * The mapWithKeys method maps each item to a [key, value] pair. Because a
     * lazy collection is value based, the resulting keys are materialized.
     * 
     * @param fn 
     * @returns 
     */
    mapWithKeys<T = Item>(fn: (item: Item, index: number | string) => [string, any]): LazyCollection<T> {
        return this.eager().mapWithKeys(fn).lazy() as never
    }

    /**
     * The filter method keeps only the items that pass the given truth test.
     * 
     * @param fn 
     * @returns 
     */
    filter(fn?: (item: Item, index: number) => boolean): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            let index = 0
            for (const item of self) {
                const keep = fn ? fn(item, index) : Boolean(item)
                index += 1
                if (keep) {
                    yield item
                }
            }
        })
    }

    /**
     * The reject method removes items that pass the given truth test.
     * 
     * @param fn 
     * @returns 
     */
    reject(fn: (item: Item, index: number) => boolean): LazyCollection<Item> {
        return this.filter((item, index) => !fn(item, index))
    }

    /**
     * The take method yields at most the given number of items. A negative
     * length takes from the end and therefore materializes the source.
     * 
     * @param limit 
     * @returns 
     */
    take(limit: number): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            if (limit < 0) {
                yield* self.eager().take(limit).all()

                return
            }

            if (limit === 0) {
                return
            }

            let count = 0
            for (const item of self) {
                yield item
                count += 1
                if (count >= limit) {
                    break
                }
            }
        })
    }

    /**
     * The takeWhile method yields items until the callback returns false.
     * 
     * @param valueOrFunction 
     * @returns 
     */
    takeWhile(valueOrFunction: Item | ((value: Item) => boolean)): LazyCollection<Item> {
        const callback = LazyCollection.valueCallback(valueOrFunction)
        const self = this

        return new LazyCollection<Item>(function* () {
            for (const item of self) {
                if (!callback(item)) {
                    break
                }
                yield item
            }
        })
    }

    /**
     * The takeUntil method yields items until the callback returns true.
     * 
     * @param valueOrFunction 
     * @returns 
     */
    takeUntil(valueOrFunction: Item | ((value: Item) => boolean)): LazyCollection<Item> {
        const callback = LazyCollection.valueCallback(valueOrFunction)
        const self = this

        return new LazyCollection<Item>(function* () {
            for (const item of self) {
                if (callback(item)) {
                    break
                }
                yield item
            }
        })
    }

    /**
     * The takeUntilTimeout method yields items until the given time is reached.
     * 
     * @param timeout 
     * @returns 
     */
    takeUntilTimeout(timeout: Date | number): LazyCollection<Item> {
        const end = timeout instanceof Date ? timeout.getTime() : Number(timeout)
        const self = this

        return new LazyCollection<Item>(function* () {
            for (const item of self) {
                if (Date.now() >= end) {
                    break
                }
                yield item
            }
        })
    }

    /**
     * The skip method skips over the first given number of items.
     * 
     * @param count 
     * @returns 
     */
    skip(count: number): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            let index = 0
            for (const item of self) {
                if (index >= count) {
                    yield item
                }
                index += 1
            }
        })
    }

    /**
     * The skipWhile method skips items while the callback returns true.
     * 
     * @param valueOrFunction 
     * @returns 
     */
    skipWhile(valueOrFunction: Item | ((value: Item) => boolean)): LazyCollection<Item> {
        const callback = LazyCollection.valueCallback(valueOrFunction)
        const self = this

        return new LazyCollection<Item>(function* () {
            let skipping = true
            for (const item of self) {
                if (skipping && callback(item)) {
                    continue
                }
                skipping = false
                yield item
            }
        })
    }

    /**
     * The skipUntil method skips items until the callback returns true.
     * 
     * @param valueOrFunction 
     * @returns 
     */
    skipUntil(valueOrFunction: Item | ((value: Item) => boolean)): LazyCollection<Item> {
        const callback = LazyCollection.valueCallback(valueOrFunction)
        const self = this

        return new LazyCollection<Item>(function* () {
            let skipping = true
            for (const item of self) {
                if (skipping && !callback(item)) {
                    continue
                }
                skipping = false
                yield item
            }
        })
    }

    /**
     * The slice method returns a slice starting at the given index.
     * 
     * @param start 
     * @param size 
     * @returns 
     */
    slice(start: number, size?: number): LazyCollection<Item> {
        if (start < 0 || (size !== undefined && size < 0)) {
            return this.eager().slice(start, size).lazy()
        }

        let collection = this.skip(start)

        if (size !== undefined) {
            collection = collection.take(size)
        }

        return collection
    }

    /**
     * The nth method yields every n-th item, optionally after an offset.
     * 
     * @param n 
     * @param offset 
     * @returns 
     */
    nth(n: number, offset = 0): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            let index = 0
            for (const item of self) {
                if (index >= offset && (index - offset) % n === 0) {
                    yield item
                }
                index += 1
            }
        })
    }

    /**
     * The values method returns a re-enumerable lazy collection of the values.
     * 
     * @returns 
     */
    values(): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(() => self[Symbol.iterator]())
    }

    /**
     * The keys method yields the (zero based) index of each item.
     */
    keys(): LazyCollection<number> {
        const self = this

        return new LazyCollection<number>(function* () {
            let index = 0
            for (const _ of self) {
                yield index
                index += 1
            }
        })
    }

    /**
     * The flatten method lazily flattens a nested structure by the given depth.
     * 
     * @param depth 
     * @returns 
     */
    flatten(depth: number = Infinity): LazyCollection<Item> {
        const self = this

        function* flat(iterable: Iterable<any>, remaining: number): Generator<any> {
            for (const item of iterable) {
                const nested = Array.isArray(item) || (item !== null && typeof item === 'object')

                if (nested && remaining > 0) {
                    const inner = Array.isArray(item) ? item : Object.values(item)
                    yield* flat(inner, remaining - 1)
                } else {
                    yield item
                }
            }
        }

        return new LazyCollection<Item>(function* () {
            yield* flat(self, depth)
        })
    }

    /**
     * The flatMap method maps each item and flattens the result by one level.
     * 
     * @param fn 
     * @returns 
     */
    flatMap<T = Item>(fn: (item: Item, index: number) => T): LazyCollection<T> {
        return this.map(fn).flatten(1) as never
    }

    /**
     * The pluck method retrieves the value at the given path from each item.
     * 
     * @param value 
     * @param key 
     * @returns 
     */
    pluck<V = any>(value: keyof Item | string, key?: keyof Item | string): LazyCollection<V> {
        if (key !== undefined) {
            return this.eager().pluck(value as never, key as never).lazy() as never
        }

        const self = this

        return new LazyCollection<V>(function* () {
            for (const item of self) {
                const resolved = nestedValue(item, value)
                yield (resolved !== undefined ? resolved : null) as V
            }
        })
    }

    /**
     * The unique method lazily yields the first occurrence of each item.
     * 
     * @param key 
     * @returns 
     */
    unique<K = Item>(key?: keyof Item | K | ((item: Item) => any)): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            const seen = new Set<any>()
            for (const item of self) {
                let uniqueKey: any = item
                if (key !== undefined) {
                    uniqueKey = isFunction(key) ? key(item) : (item as any)[key]
                }

                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey)
                    yield item
                }
            }
        })
    }

    /**
     * The chunk method breaks the collection into lazily emitted chunks.
     * 
     * @param size 
     * @returns 
     */
    chunk(size: number): LazyCollection<Collection<Item>> {
        const self = this

        return new LazyCollection<Collection<Item>>(function* () {
            let batch: Item[] = []
            for (const item of self) {
                batch.push(item)
                if (batch.length >= size) {
                    yield new Collection<Item>(batch)
                    batch = []
                }
            }
            if (batch.length) {
                yield new Collection<Item>(batch)
            }
        })
    }

    /**
     * The chunkWhile method chunks the collection while the callback is true.
     * 
     * @param fn 
     * @returns 
     */
    chunkWhile(fn: (value: Item, chunk: Collection<Item>) => boolean): LazyCollection<Collection<Item>> {
        const self = this

        return new LazyCollection<Collection<Item>>(function* () {
            let chunk: Item[] = []
            for (const item of self) {
                if (chunk.length === 0 || fn(item, new Collection<Item>(chunk))) {
                    chunk.push(item)
                } else {
                    yield new Collection<Item>(chunk)
                    chunk = [item]
                }
            }
            if (chunk.length) {
                yield new Collection<Item>(chunk)
            }
        })
    }

    /**
     * The concat method lazily appends another source after this one.
     * 
     * @param source 
     * @returns 
     */
    concat(source: Source<Item>): LazyCollection<Item> {
        const self = this
        const other = new LazyCollection<Item>(source)

        return new LazyCollection<Item>(function* () {
            yield* self
            yield* other
        })
    }

    /**
     * The prepend method lazily yields the given value before the collection.
     * 
     * @param value 
     * @returns 
     */
    prepend(value: Item): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            yield value
            yield* self
        })
    }

    /**
     * The push method lazily yields the given values after the collection.
     * 
     * @param items 
     * @returns 
     */
    push(...items: Item[]): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            yield* self
            yield* items
        })
    }

    /**
     * The tapEach method runs the callback as each item is pulled, without
     * altering the items, allowing you to "tap" into a lazy stream.
     * 
     * @param fn 
     * @returns 
     */
    tapEach(fn: (item: Item, index: number) => void): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            let index = 0
            for (const item of self) {
                fn(item, index)
                index += 1
                yield item
            }
        })
    }

    /**
     * The remember method memoizes the values already enumerated so that the
     * underlying source is only ever iterated once, even across re-enumeration.
     */
    remember(): LazyCollection<Item> {
        const self = this
        const cache: Item[] = []
        let iterator: Iterator<Item> | null = null
        let done = false

        return new LazyCollection<Item>(function* () {
            let index = 0

            while (true) {
                if (index < cache.length) {
                    yield cache[index]
                    index += 1
                    continue
                }

                if (done) {
                    return
                }

                if (!iterator) {
                    iterator = self[Symbol.iterator]()
                }

                const next = iterator.next()

                if (next.done) {
                    done = true

                    return
                }

                cache.push(next.value)
                yield next.value
                index += 1
            }
        })
    }

    /**
     * The throttle method waits the given number of seconds between each item.
     * Note: throttling is synchronous (blocking) in this environment.
     * 
     * @param seconds 
     * @returns 
     */
    throttle(seconds: number): LazyCollection<Item> {
        const self = this

        return new LazyCollection<Item>(function* () {
            let first = true
            for (const item of self) {
                if (!first && seconds > 0) {
                    const until = Date.now() + (seconds * 1000)
                    while (Date.now() < until) { /* block */ }
                }
                first = false
                yield item
            }
        })
    }

    where<V, K = Item>(key?: keyof Item | K, operator?: Operator | V, value?: V | null): LazyCollection<Item> {
        return this.filter(LazyCollection.wherePredicate<Item>(key, operator, value))
    }

    whereIn<V, K = Item>(key: keyof Item | K, values: V[] | Collection<V>): LazyCollection<Item> {
        const items = getValues(values as never)

        return this.filter(item => items.indexOf(nestedValue(item, String(key))) !== -1)
    }

    whereNotIn<V, K = Item>(key: keyof Item | K, values: V[] | Collection<V>): LazyCollection<Item> {
        const items = getValues(values as never)

        return this.filter(item => items.indexOf(nestedValue(item, String(key))) === -1)
    }

    whereBetween<V, K = Item>(key: keyof Item | K, values: V[]): LazyCollection<Item> {
        return this.where(key, '>=', values[0]).where(key, '<=', values[values.length - 1])
    }

    whereNotBetween<V, K = Item>(key: keyof Item | K, values: V[]): LazyCollection<Item> {
        return this.filter(item => (
            nestedValue(item, String(key)) < values[0]
            || nestedValue(item, String(key)) > values[values.length - 1]
        ))
    }

    whereNull<K = Item>(key?: keyof Item | K): LazyCollection<Item> {
        return this.where(key, '===', null)
    }

    whereNotNull<K = Item>(key?: keyof Item | K): LazyCollection<Item> {
        return this.where(key, '!==', null)
    }

    whereInstanceOf(type: abstract new (...args: any[]) => any): LazyCollection<Item> {
        return this.filter(item => item instanceof type)
    }

    /**
     * The first method returns the first item passing the optional truth test.
     * 
     * @param fn 
     * @param defaultValue 
     * @returns 
     */
    first(fn?: (item: Item, index: number) => boolean, defaultValue?: (() => any) | any): Item | undefined {
        let index = 0
        for (const item of this) {
            if (!fn || fn(item, index)) {
                return item
            }
            index += 1
        }

        return isFunction(defaultValue) ? defaultValue() : defaultValue
    }

    firstWhere<V, K = Item>(key?: keyof Item | K, operator?: Operator | V, value?: V | null): Item | undefined {
        return this.where(key, operator, value).first()
    }

    firstOrFail<V, K = Item>(key?: keyof Item | K | ((item: Item) => boolean), operator?: Operator | V, value?: V | null): Item {
        const found = isFunction(key)
            ? this.first(key)
            : this.where(key, operator, value).first()

        if (found === undefined) {
            throw new Error('Item not found.')
        }

        return found
    }

    /**
     * The contains method determines whether the collection contains an item.
     * 
     * @param key 
     * @param value 
     * @returns 
     */
    contains<V>(key: keyof Item | ((item: Item, index: number) => boolean) | Item, value?: V): boolean {
        if (typeof value !== 'undefined') {
            for (const item of this) {
                if ((item as any)?.[key as never] === value) {
                    return true
                }
            }

            return false
        }

        if (isFunction(key)) {
            let index = 0
            for (const item of this) {
                if ((key as (i: Item, k: number) => boolean)(item, index)) {
                    return true
                }
                index += 1
            }

            return false
        }

        for (const item of this) {
            if (item === key) {
                return true
            }
        }

        return false
    }

    some<V>(key: keyof Item | ((item: Item, index: number) => boolean) | Item, value?: V): boolean {
        return this.contains(key, value)
    }

    doesntContain<V>(key: keyof Item | ((item: Item, index: number) => boolean) | Item, value?: V): boolean {
        return !this.contains(key, value)
    }

    /**
     * The search method returns the index of the first matching item or false.
     * 
     * @param valueOrFunction 
     * @param strict 
     * @returns 
     */
    search(valueOrFunction: Item | ((value: Item, index: number) => boolean), strict?: boolean): number | false {
        let index = 0
        for (const item of this) {
            const found = isFunction(valueOrFunction)
                ? valueOrFunction(item, index)
                : (strict ? item === valueOrFunction : item == valueOrFunction)

            if (found) {
                return index
            }
            index += 1
        }

        return false
    }

    /**
     * The each method iterates over the items, stopping early on a false return.
     * 
     * @param fn 
     * @returns 
     */
    each(fn: (item: Item, index: number) => any): this {
        let index = 0
        for (const item of this) {
            if (fn(item, index) === false) {
                break
            }
            index += 1
        }

        return this
    }

    /**
     * The eachSpread method spreads each item into the callback arguments.
     * 
     * @param fn 
     * @returns 
     */
    eachSpread(fn: (...args: any[]) => any): this {
        return this.each((values: any, index) => fn(...values, index))
    }

    /**
     * The every method verifies that all items pass the given truth test.
     * 
     * @param fn 
     * @returns 
     */
    every(fn: (item: Item, index: number) => boolean): boolean {
        let index = 0
        for (const item of this) {
            if (!fn(item, index)) {
                return false
            }
            index += 1
        }

        return true
    }

    /**
     * The containsOneItem method checks the collection holds exactly one item.
     * 
     * @returns 
     */
    containsOneItem(): boolean {
        let count = 0
        for (const _ of this) {
            count += 1
            if (count > 1) {
                return false
            }
        }

        return count === 1
    }

    /**
     * The sole method returns the single item matching the given constraints.
     * 
     * @param key 
     * @param operator 
     * @param value 
     * @returns 
     */
    sole<V, K = Item>(key?: keyof Item | K | ((item: Item) => boolean), operator?: Operator | V, value?: V): Item {
        return this.eager().sole(key as never, operator as never, value) as Item
    }

    /**
     * The all method enumerates the source fully and returns a plain array.
     */
    all(): Item[] {
        const result: Item[] = []
        for (const item of this) {
            result.push(item)
        }

        return result
    }

    /**
     * The eager method converts the lazy collection into a Collection.
     */
    eager(): Collection<Item> {
        return new Collection<Item>(this.all())
    }

    /**
     * Alias for eager().
     */
    collect(): Collection<Item> {
        return this.eager()
    }

    toArray(): Item[] {
        return this.eager().toArray()
    }

    toJson(): string {
        return this.eager().toJson()
    }

    isEmpty(): boolean {
        for (const _ of this) {
            return false
        }

        return true
    }

    isNotEmpty(): boolean {
        return !this.isEmpty()
    }

    count(): number {
        let count = 0
        for (const _ of this) {
            count += 1
        }

        return count
    }

    countBy(fn: ((value: Item) => any) = value => value): Collection<number, Record<string, number>> {
        return this.eager().countBy(fn)
    }

    last(fn?: (item: Item) => boolean, defaultValue?: any): Item {
        return this.eager().last(fn, defaultValue)
    }

    reduce<T = Item>(fn: (carry: T | null | undefined, item: Item, index: number | string) => T, carry?: T): T | null {
        return this.eager().reduce(fn as never, carry)
    }

    sum<K = Item>(key?: keyof Item | K | ((item: Item) => number | string)): number {
        return this.eager().sum(key as never)
    }

    avg(key?: keyof Item | ((p: Item) => any)): number {
        return this.eager().avg(key)
    }

    average(key?: keyof Item | ((p: Item) => any)): number {
        return this.eager().average(key)
    }

    min<K = Item>(key?: keyof Item | K): number {
        return this.eager().min(key as never)
    }

    max(key?: keyof Item | string): number {
        return this.eager().max(key as never)
    }

    median<K = Item>(key?: keyof Item | K): number {
        return this.eager().median(key as never)
    }

    mode<K = Item>(key?: keyof Item | K): Item[] | null {
        return this.eager().mode(key as never)
    }

    implode<K = Item>(key: keyof Item | K, glue?: string): string {
        return this.eager().implode(key as never, glue)
    }

    join(glue: string, finalGlue: string): string | Item {
        return this.eager().join(glue, finalGlue)
    }

    has(...args: any[]): boolean {
        return this.eager().has(...args)
    }

    get<V, K = Item>(key: keyof Item | K, defaultValue?: ((...args: any[]) => V | Item) | V | Item) {
        return this.eager().get(key as never, defaultValue)
    }

    random(length?: number | string): Collection<Item> {
        return this.eager().random(length)
    }

    pipe<U>(fn: (collection: LazyCollection<Item>) => U): U {
        return fn(this)
    }

    tap(fn: (collection: LazyCollection<Item>) => void): this {
        fn(this)

        return this
    }

    dump(...args: unknown[]): this {
        this.eager().dump(...args)

        return this
    }

    dd(...args: unknown[]): void {
        this.eager().dd(...args)
    }

    when(
        condition: boolean,
        fn: (collection: LazyCollection<Item>, condition?: boolean) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>, condition?: boolean) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        if (condition) {
            return fn(this, condition) ?? this
        }

        if (defaultFn) {
            return defaultFn(this, condition) ?? this
        }

        return this
    }

    unless(
        condition: boolean,
        fn: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        return this.when(!condition, fn, defaultFn)
    }

    whenEmpty(
        fn: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        return this.when(this.isEmpty(), fn, defaultFn)
    }

    whenNotEmpty(
        fn: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        return this.when(this.isNotEmpty(), fn, defaultFn)
    }

    unlessEmpty(
        fn: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        return this.whenNotEmpty(fn, defaultFn)
    }

    unlessNotEmpty(
        fn: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
        defaultFn?: (collection: LazyCollection<Item>) => LazyCollection<Item> | void,
    ): LazyCollection<Item> {
        return this.whenEmpty(fn, defaultFn)
    }

    sort(fn?: (a: Item, b: Item) => number): LazyCollection<Item> {
        return this.eager().sort(fn).lazy()
    }

    sortDesc(): LazyCollection<Item> {
        return this.eager().sortDesc().lazy()
    }

    sortBy<V>(key: V | V[] | ((item: Item) => number)): LazyCollection<Item> {
        return this.eager().sortBy(key as never).lazy()
    }

    sortByDesc(fn: any): LazyCollection<Item> {
        return this.eager().sortByDesc(fn).lazy()
    }

    sortByMany<V>(value: (V | (() => any))[]): LazyCollection<Item> {
        return this.eager().sortByMany(value).lazy()
    }

    sortKeys(): LazyCollection<Item> {
        return this.eager().sortKeys().lazy()
    }

    sortKeysDesc(): LazyCollection<Item> {
        return this.eager().sortKeysDesc().lazy()
    }

    reverse(): LazyCollection<Item> {
        return this.eager().reverse().lazy()
    }

    shuffle(): LazyCollection<Item> {
        return this.eager().shuffle().lazy()
    }

    collapse(): LazyCollection<Item> {
        return this.eager().collapse().lazy()
    }

    groupBy<K>(key: ((item: Item, index?: number) => K) | keyof Item | K): LazyCollection<Collection<Item>> {
        return this.eager().groupBy(key).lazy() as never
    }

    partition(fn: (item: Item) => boolean): LazyCollection<Collection<Item>> {
        return this.eager().partition(fn).lazy() as never
    }

    split(numberOfGroups: number): LazyCollection<Collection<Item>> {
        return this.eager().split(numberOfGroups).lazy() as never
    }

    flip(): LazyCollection<string | number> {
        return this.eager().flip().lazy() as never
    }

    duplicates(): LazyCollection<Item> {
        return this.eager().duplicates().lazy()
    }

    crossJoin<T = Item>(...values: (T[] | Collection)[]): LazyCollection<[Item, T]> {
        return this.eager().crossJoin(...values).lazy() as never
    }

    diff<T = Item>(values: T[] | Collection<Item>): LazyCollection<Item> {
        return this.eager().diff(values).lazy()
    }

    diffAssoc<T = Item>(values: T[] | Collection<T>): LazyCollection<Item> {
        return this.eager().diffAssoc(values).lazy()
    }

    diffKeys(object: object): LazyCollection<Item> {
        return this.eager().diffKeys(object as never).lazy() as never
    }

    diffUsing<T = Item>(values: T[] | Collection<Item>, callback: (a: Item, b: Item) => any): LazyCollection<Item> {
        return this.eager().diffUsing(values, callback).lazy()
    }

    intersect(values: Item[] | Collection<Item>): LazyCollection<Item> {
        return this.eager().intersect(values).lazy()
    }

    intersectByKeys(values: Item | Collection<Item>): LazyCollection<Item> {
        return this.eager().intersectByKeys(values).lazy() as never
    }

    dot(): LazyCollection<Item> {
        return this.eager().dot().lazy() as never
    }

    undot(): LazyCollection<Item> {
        return this.eager().undot().lazy() as never
    }

    mapToGroups(fn: (item: Item, key: string | number) => [any, any]): LazyCollection<any> {
        return this.eager().mapToGroups(fn).lazy()
    }

    mapToDictionary(fn: (item: Item, index: any) => [any, any]): LazyCollection<Item> {
        return this.eager().mapToDictionary(fn).lazy()
    }

    mapSpread(fn: (...items: Item[]) => any): LazyCollection<any> {
        return this.eager().mapSpread(fn).lazy()
    }

    pad(size: number, value: number): LazyCollection<Item> {
        return this.eager().pad(size, value).lazy()
    }

    merge<T = Item>(value: Record<string, any> | T[]): LazyCollection<T> {
        return this.eager().merge(value).lazy() as never
    }

    mergeRecursive(items: Record<string, any> | Collection): LazyCollection<Item> {
        return this.eager().mergeRecursive(items).lazy()
    }

    combine<U, T = Item>(array: U[] | Collection): LazyCollection<T> {
        return this.eager().combine(array).lazy() as never
    }

    replace(items?: Item[] | Collection<Item> | Record<string, any>): LazyCollection<Item> {
        return this.eager().replace(items).lazy()
    }

    replaceRecursive(items: Item[] | Collection | Record<string, any>): LazyCollection<Item> {
        return this.eager().replaceRecursive(items).lazy()
    }

    union<T = Item>(object: Record<string, any>): LazyCollection<T> {
        return this.eager().union(object).lazy() as never
    }

    zip<T = Item>(array: T[] | Collection): LazyCollection<[Item, T]> {
        return this.eager().zip(array).lazy() as never
    }
}
