//#region src/collection.d.ts
type Operator = '===' | '==' | '!==' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | boolean;
type GenericObj<X$1 = any> = Record<string, X$1>;
declare class Collection<Item = any> {
  private items;
  /**
   *
   * @param collection
   */
  constructor(collection?: Record<string, Item> | Item[] | Item);
  /**
   * The add method adds a single item to the collection.
   */
  add(item: Item): this;
  /**
   * The all method returns the underlying array represented by the collection.
   */
  all(): Item[];
  /**
   * Alias for the avg() method.
   */
  average(key?: keyof Item | ((p: Item) => any)): number;
  /**
   * The avg method returns the average of all items in the collection.
   */
  avg(key?: keyof Item | ((p: Item) => any)): number;
  /**
   * The chunk method breaks the collection into multiple, smaller collections of a given size.
   */
  chunk(size: number): Collection<Item[]>;
  /**
   * The collapse method collapses a collection of arrays into a single, flat collection.
   */
  collapse(): Collection<Item>;
  /**
   * The combine method combines the keys of the collection with the values of another array or collection.
   */
  combine<T, U>(array: U[] | Collection): Collection<T>;
  /**
   * The concat method is used to merge two or more collections/arrays/objects.
   */
  concat<T>(collectionOrArrayOrObject: T[] | Record<string, T> | Collection<T>): any;
  /**
   * The contains method determines whether the collection contains a given item.
   *
   * @param key
   * @param value
   * @returns
   */
  contains<K, V>(key: keyof Item | K | ((...args: any[]) => any), value?: V): boolean;
  /**
   * Check to ensure the collection only contains one item
   *
   * @returns
   */
  containsOneItem(): boolean;
  /**
   * The count method returns the total number of items in the collection.
   */
  count(): number;
  /**
   *
   * @param fn
   * @returns
   */
  countBy(fn?: ((value: Item) => any)): Collection<number>;
  /**
   * The crossJoin method cross joins the collection with the given array or collection, returning all possible permutations.
   */
  crossJoin<T>(...values: (T[] | Collection)[]): Collection<[Item, T]>;
  /**
   * The dd method will console.log the collection and exit the current process.
   */
  dd(...args: unknown[]): void;
  /**
   * The diff method compares the collection against another collection or a plain array based on its values.
   * This method will return the values in the original collection that are not present in the given collection.
   */
  diff<T>(values: T[] | Collection<Item>): Collection<Item>;
  /**
   * The diffAssoc method compares the collection against another collection or a plain object based on its keys
   * and values. This method will return the key / value pairs in the original collection that are not present in
   * the given collection:
   */
  diffAssoc<T>(values: T[] | Collection<T>): Collection<Item>;
  /**
   * The diffKeys method compares the collection against another collection or a plain object based on its keys.
   * This method will return the key / value pairs in the original collection that are not present in the given collection.
   *
   * @param object
   * @returns
   */
  diffKeys<K extends keyof Item>(object: object): Collection<K>;
  /**
   * The diffKeys method compares the collection against another collection or a plain object based on the result of a given callback.
   * This method will return the key / value pairs in the original collection that are not present in the given collection.
   *
   * @param object
   * @returns
   */
  diffUsing<T>(values: T[] | Collection<Item>, callback: (item: Item, otherItem: Item) => any): Collection<Item>;
  /**
   * The doesntContain method determines whether the collection doesnt contain a given item.
   *
   * @param key
   * @param value
   * @returns
   */
  doesntContain<V>(key: keyof Item | ((...args: any[]) => any), value?: V): boolean;
  /**
   * The dot method allows accessing objects using the dot notation.
   */
  dot(): this;
  /**
   * The dump method outputs the results at that moment and then continues processing.
   */
  dump(...args: unknown[]): this;
  /**
   * The duplicates method will find and return all duplicate properties in a collection
   *
   * @returns
   */
  duplicates(): Collection<Item>;
  /**
   * The each method iterates over the items in the collection and passes each item to a callback.
   */
  each(fn: (currentItem: Item, key?: string | number, collection?: Item[]) => any): this;
  /**
   *
   * @param fn
   * @returns
   */
  eachSpread(fn: (...items: any[]) => any): this;
  /**
   * The every method may be used to verify that all elements of a collection pass a given truth test.
   */
  every(fn: (item: Item) => boolean): boolean;
  /**
   * The except method returns all items in the collection except for those with the specified keys.
   */
  except<K>(...args: K[]): Collection<Item>;
  /**
   * The filter method filters the collection using the given callback,
   * keeping only those items that pass a given truth test.
   */
  filter(fn: (item: Item) => boolean): Collection<Item>;
  /**
   * The first method returns the first element in the collection that passes a given truth test.
   */
  first<V>(fn?: (item: Item, key: any) => boolean, defaultValue?: ((...any: any[]) => V | Item) | V | Item): Collection<Item> | undefined;
  /**
   *
   * @param key
   * @param operator
   * @param value
   * @returns
   */
  firstOrFail<V>(key?: keyof Item, operator?: Operator, value?: V | null | undefined): Collection<Item> | undefined;
  /**
   *
   * @param key
   * @param operator
   * @param value
   * @returns
   */
  firstWhere<K, V>(key?: keyof Item, operator?: Operator | K, value?: V | null | undefined): Collection<Item> | undefined;
  /**
   * The flatMap method iterates through the collection and passes each value to the given callback.
   * The callback is free to modify the item and return it, thus forming a new collection of modified items.
   * Then, the array is flattened by a level.
   */
  flatMap<T>(fn: (item: Item, key: any) => T): Collection<T>;
  /**
   * The flatten method flattens a multi-dimensional collection into a single dimension.
   */
  flatten(depth?: number): Collection<Item>;
  /**
   * The flip method swaps the collection's keys with their corresponding values.
   */
  flip(): Collection<Item>;
  /**
   * The forget method removes an item from the collection by its key.
   */
  forget<K>(key: keyof Item | K): this;
  /**
   * The forPage method returns a new collection containing the items that would be present on a given page number.
   * The method accepts the page number as its first argument
   * and the number of items to show per page as its second argument.
   */
  forPage(page: number, chunk: number): Collection<Item>;
  /**
   * The get method returns the item at a given key. If the key does not exist, null is returned.
   */
  get<K, V>(key: keyof Item | K, defaultValue?: ((...any: any[]) => V | Item) | V | Item): Item | V | undefined;
  /**
   * The groupBy method groups the collection's items by a given key.
   *
   */
  groupBy<T, K>(key: ((item: Item, index?: number) => K) | keyof Item | K): Collection<T>;
  /**
   * The has method determines if one or more keys exists in the collection.
   */
  has(...args: any[]): boolean;
  /**
   * The implode method joins the items in a collection.
   * Its arguments depend on the type of items in the collection.
   *
   * If the collection contains arrays or objects,
   * you should pass the key of the attributes you wish to join,
   * and the "glue" string you wish to place between the values.
   */
  implode<K>(key: keyof Item | K, glue?: string): string;
  /**
   * The intersect method removes any values from the original collection
   * that are not present in the given array or collection.
   * The resulting collection will preserve the original collection's keys.
   */
  intersect(values: Item[] | Collection<Item>): Collection<Item>;
  /**
   * The intersectByKeys method removes any keys from the original collection
   * that are not present in the given array or collection.
   */
  intersectByKeys<K extends keyof Item>(values: Item | Collection<Item>): Collection<K>;
  /**
   * The isEmpty method returns true if the collection is empty; otherwise, false is returned.
   */
  isEmpty(): boolean;
  /**
   * The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned.
   */
  isNotEmpty(): boolean;
  /**
   * Join the items in a callection with the provided glue
   *
   * @param glue
   * @param finalGlue
   * @returns
   */
  join(glue: string, finalGlue: string): unknown;
  /**
   * The keyBy method keys the collection by the given key.
   * If multiple items have the same key, only the last one will appear in the new collection.
   */
  keyBy<T, K>(key: keyof Item | K | ((...args: any[]) => any)): Collection<T>;
  /**
   * The keys method returns all of the collection's keys.
   */
  keys(): Collection<string>;
  /**
   * The last method returns the last element in the collection that passes a given truth test.
   */
  last(fn?: (item: Item) => boolean, defaultValue?: any): Item;
  /**
   * The macro method lets you register custom methods.
   */
  macro(name: string, fn: (...args: any[]) => any): void;
  /**
   * The make method will make a new collection from nothing
   *
   * @param items
   * @returns
   */
  make<T>(items?: never[]): Collection<T>;
  /**
   * The map method iterates through the collection and passes each value to the given callback.
   * The callback is free to modify the item and return it, thus forming a new collection of modified items.
   */
  map<T>(fn: (items: Item, index: any, key?: any) => T): Collection<T>;
  /**
   * The mapInto method iterates through the collection and instantiates the given class with each element as a constructor.
   */
  mapInto<T extends new (...args: any[]) => any>(ClassName: T): Collection<T>;
  mapSpread(fn: (...items: Item[]) => any): Collection<any>;
  mapToDictionary(fn: (item: Item, index: any) => [any, any]): Collection<Item>;
  /**
   * The mapToGroups method iterates through the collection and passes each value to the given callback.
   */
  mapToGroups(fn: (item: Item, key: string | number) => [any, any]): Collection<any>;
  /**
   * The mapWithKeys method iterates through the collection and passes each value to the given callback.
   * The callback should return an array where the first element represents the key
   * and the second element represents the value pair.
   */
  mapWithKeys<T>(fn: (item: Item, index: number | string) => [string, any]): Collection<T>;
  /**
   * The max method returns the maximum value of a given key.
   */
  max(key?: keyof Item | string): number;
  /**
   * The median method returns the median value of a given key.
   */
  median<K>(key?: keyof Item | K): number;
  /**
   * The merge method merges the given object into the original collection.
   * If a key in the given object matches a key in the original collection,
   * the given objects value will overwrite the value in the original collection.
   *
   * @param value
   * @returns
   */
  merge<T>(value: GenericObj | T[]): Collection<T>;
  /**
   * The mergeRecursive method recursively merges the given object into the original collection.
   * If a key in the given object matches a key in the original collection,
   * the given objects value will overwrite the value in the original collection.
   *
   * @param items
   * @returns
   */
  mergeRecursive(items: GenericObj | Collection): Collection<Item>;
  /**
   * The min method returns the minimum value of a given key.
   */
  min<K>(key?: keyof Item | K): number;
  /**
   * The mode method returns the mode value of a given key.
   */
  mode<K>(key?: keyof Item | K): Item[] | null;
  /**
   * The nth method creates a new collection consisting of every n-th element.
   */
  nth(n: number, offset?: number): Collection<Item>;
  /**
   * The only method returns the items in the collection with the specified keys.
   */
  only<K>(...args: K[]): Collection<Item>;
  /**
   *
   * @param size
   * @param value
   * @returns
   */
  pad(size: number, value: number): Collection<Item>;
  /**
   * The partition method may be combined with destructuring to separate elements
   * that pass a given truth test from those that do not.
   */
  partition(fn: (item: Item) => boolean): [Item[], Item[]];
  /**
   * The pipe method passes the collection to the given callback and returns the result.
   */
  pipe<U>(fn: (...any: any[]) => U): U;
  /**
   * The pluck method retrieves all of the values for a given key.
   */
  pluck<T, K, V>(value: keyof Item | V, key?: keyof Item | K): Collection<T>;
  /**
   * The pop method removes and returns the last item from the collection.
   */
  pop(count?: number): Item | Collection<Item> | undefined;
  /**
   * The prepend method adds an item to the beginning of the collection.
   */
  prepend<K, V>(value: V, key?: K): this;
  /**
   * The pull method removes and returns an item from the collection by its key.
   */
  pull<K>(key: keyof Item | K, defaultValue?: any): Item | null;
  /**
   * The push method appends an item to the end of the collection.
   */
  push(...items: Item[]): this;
  /**
   * The put method sets the given key and value in the collection.
   */
  put<K, V>(key: K, value: V): this;
  /**
   * The random method returns a random item from the collection.
   */
  random(length?: number | string): Collection<Item>;
  /**
   * The reduce method reduces the collection to a single value,
   * passing the result of each iteration into the subsequent iteration.
   */
  reduce<T>(fn: (_carry?: T | null, item?: Item, index?: number | string) => T, carry?: T): any;
  /**
   * The reject method filters the collection using the given callback.
   * The callback should return true if the item should be removed from the resulting collection.
   */
  reject(fn: (item: Item) => boolean): Collection<Item>;
  /**
   * the replace method will replace matching properties in the collection
   *
   * @param items
   * @returns
   */
  replace(items?: Item[] | Collection<Item> | GenericObj): Collection<any>;
  /**
   * the replaceRecursive method will recursively replace matching properties in the collection
   *
   * @param items
   * @returns
   */
  replaceRecursive(items: Item[] | Collection | GenericObj): Collection<Item>;
  /**
   * The reverse method reverses the order of the collection's items.
   */
  reverse(): Collection<Item>;
  /**
   * The search method searches the collection for the given value and returns its key if found.
   * If the item is not found, false is returned.
   */
  search(valueOrFunction: Item | ((value: Item, key: number) => boolean), strict?: boolean): any;
  /**
   * The shift method removes and returns the first item from the collection.
   */
  shift(count?: number): Collection<Item> | undefined;
  /**
   * The shuffle method randomly shuffles the items in the collection.
   */
  shuffle(): this;
  /**
   *
   * @param number
   * @returns
   */
  skip(number: number): Collection<Item>;
  /**
   *
   * @param valueOrFunction
   * @returns
   */
  skipUntil<K>(valueOrFunction: Item | K | ((value: Item) => boolean)): Collection<Item>;
  /**
   *
   * @param valueOrFunction
   * @returns
   */
  skipWhile(valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item>;
  /**
   * The slice method returns a slice of the collection starting at the given index.
   */
  slice(remove: number, limit?: number): Collection<Item>;
  sole<K, V>(key?: keyof Item | K | ((val: Item) => any), operator?: Operator | K, value?: V): Collection<Item> | undefined;
  /**
   * The some method determines whether the collection contains a given item.
   *
   * @param key
   * @param value
   * @alias contains
   * @returns
   */
  some<V>(key: keyof Item | ((...args: any[]) => any), value?: V): boolean;
  /**
   * The sort method sorts the collection.
   */
  sort(fn?: (a: Item, b: Item) => number): Collection<Item>;
  /**
   * The sortBy method sorts the collection by the given key.
   * The sorted collection keeps the original array keys.
   */
  sortBy<V>(value: V): Collection<Item>;
  /**
   * The sortBy method sorts the collection by the given callback.
   * The sorted collection keeps the original array keys.
   */
  sortBy(fn: (item: Item) => number): Collection<Item>;
  /**
   * The sortByMany method sorts the collection by the given keys.
   * The sorted collection keeps the original array keys.
   */
  sortBy<V>(keys: V[]): Collection<Item>;
  /**
   * The sortByMany method sorts the collection by the given callbacks.
   * The sorted collection keeps the original array keys.
   */
  sortBy(fns: ((item: Item) => number)[]): Collection<Item>;
  /**
   * The sortBy method sorts the collection by the given callback.
   * The sorted collection keeps the original array keys.
   */
  sortBy(fn: (item: Item) => number): Collection<Item>;
  sortBy<V>(key: V[] | ((item: Item) => number)): Collection<Item>;
  /**
   * This method has the same signature as the sortBy method,
   * but will sort the collection in the opposite order.
   */
  sortByDesc<V>(value: V): Collection<Item>;
  /**
   * This method has the same signature as the sortBy method,
   * but will sort the collection in the opposite order.
   */
  sortByDesc(fn: (item: Item) => number): Collection<Item>;
  /**
   * The sortByMany method sorts the collection by the given callbacks.
   * The sorted collection keeps the original array keys.
   */
  sortByMany<V>(value: (V | (() => any))[]): Collection<Item>;
  /**
   *
   * @returns
   */
  sortDesc(): Collection<Item>;
  sortKeys(): Collection<Item>;
  /**
   *
   * @returns
   */
  sortKeysDesc(): Collection<Item>;
  /**
   * The splice method removes and returns a slice of items starting at the specified index.
   * You may pass a second argument to limit the size of the resulting chunk.
   */
  splice(index: number, limit: number, replace?: Item[]): Collection<Item>;
  /**
   * The split method breaks a collection into the given number of groups.
   */
  split(numberOfGroups: number): Collection;
  /**
   * The sum method returns the sum of all items in the collection.
   */
  sum<K>(key?: keyof Item | K | ((item: Item) => number | string)): number;
  /**
   * The take method returns a new collection with the specified number of items:
   * You may also pass a negative integer to take the specified amount of items from the end of the collection.
   */
  take(length: number): Collection<Item>;
  /**
   *
   * @param valueOrFunction
   * @returns
   */
  takeUntil(valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item>;
  /**
   *
   * @param valueOrFunction
   * @returns
   */
  takeWhile(valueOrFunction: Item | ((value: Item) => boolean)): Collection<Item>;
  /**
   * The tap method passes the collection to the given callback,
   * allowing you to "tap" into the collection at a specific point
   * and do something with the items while not affecting the collection itself.
   */
  tap(fn: (collection: Collection<Item>) => void): this;
  /**
   * The times method creates a new collection by invoking the callback a given amount of times.
   */
  times(times: number, fn: (time: number) => any): this;
  /**
   * The toArray method converts the collection into a plain array.
   * If the collection is an object, an array containing the values will be returned.
   */
  toArray(): Item[];
  /**
   * The toJson method converts the collection into JSON string.
   */
  toJson(): string;
  protected toJSON(): Item[];
  /**
   * The transform method iterates over the collection and calls the given callback with each item in the collection.
   * The items in the collection will be replaced by the values returned by the callback.
   */
  transform<T>(fn: (item: Item, key?: number) => T): this;
  /**
   * The union method adds the given array to the collection.
   * If the given array contains keys that are already in the original collection,
   * the original collection's values will be preferred.
   */
  union<T>(object: GenericObj): Collection<T>;
  /**
   * The unique method returns all of the unique items in the collection.
   */
  unique<K>(key?: keyof Item | K | ((...args: any[]) => any)): Collection<Item>;
  /**
   * The unless method will execute the given callback when the first argument given to the method evaluates to false.
   */
  unless(condition: boolean, fn: (collection: Collection<Item>) => Collection<Item>, defaultFn?: (collection: Collection<Item>) => Collection<Item>): Collection<Item>;
  /**
   * The unwrap method will unwrap the given collection.
   */
  unwrap<T>(value: T[] | Collection<T>): T[];
  /**
   * The values method returns a new collection with the keys reset to consecutive integers.
   */
  values<T>(): Collection<T>;
  /**
   *
   * @returns
   */
  undot(): Collection<Item>;
  /**
   * Run the given callback if the result is empty
   * @param fn
   * @param defaultFn
   * @alias whenEmpty
   *
   * @returns
   */
  unlessEmpty(fn: (collection: Collection<Item>) => Collection<Item>, defaultFn?: (collection: Collection<Item>) => Collection<Item>): Collection<Item>;
  /**
   * Run the given callback if the result is empty
   * @param fn
   * @param defaultFn
   * @alias whenEmpty
   *
   * @returns
   */
  unlessNotEmpty(fn: (collection: Collection<Item>) => Collection<Item>, defaultFn?: (collection: Collection<Item>) => Collection<Item>): Collection<Item>;
  /**
   * The when method will execute the given callback when the first argument given to the method evaluates to true.
   */
  when(condition: boolean, fn: (collection: Collection<Item>, condition?: boolean) => Collection<Item>, defaultFn?: (collection: Collection<Item>, condition?: boolean) => Collection<Item>): Collection<Item>;
  /**
   * Run the given callback if the result is empty
   * @param fn
   * @param defaultFn
   * @returns
   */
  whenEmpty(fn: (collection: Collection<Item>) => Collection<Item>, defaultFn?: (collection: Collection<Item>) => Collection<Item>): Collection<Item>;
  /**
   * Run the given callback if the result is not empty
   * @param fn
   * @param defaultFn
   * @returns
   */
  whenNotEmpty(fn: (collection: Collection<Item>) => Collection<Item>, defaultFn?: (collection: Collection<Item>) => Collection<Item>): Collection<Item>;
  /**
   * The where method filters the collection by a given key / value pair.
  */
  where<K, V>(key: keyof Item | K, value: V): Collection<Item>;
  where<K, V>(key?: keyof Item | K, operator?: Operator | K, value?: V | null | undefined): Collection<Item>;
  /**
   *
   * The whereBetween method filters the collection by a key value range.
   *
   * @param key
   * @param values
   * @returns
   */
  whereBetween<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;
  /**
   * The whereIn method filters the collection by a given key / value contained within the given array.
   */
  whereIn<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;
  /**
   *
   * @param type
   * @returns
   */
  whereInstanceOf(type: abstract new (...args: any[]) => any): Collection<Item>;
  /**
   *
   * The whereNotBetween method filters the collection by a given key / value not contained within the given arguements.
   *
   * @param key
   * @param values
   * @returns
   */
  whereNotBetween<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;
  /**
   * The whereNotIn method filters the collection by a given key / value not contained within the given array.
   */
  whereNotIn<K, V>(key: keyof Item | K, values: V[]): Collection<Item>;
  /**
   * Filter only items in the collectino that do not have null values
   *
   * @param key
   * @returns
   */
  whereNotNull(key?: keyof Item): Collection<Item>;
  /**
   * The whereNull method filters items where the given key is null.
   *
   * @param key
   * @returns
   */
  whereNull<K>(key?: keyof Item | K | null | undefined): Collection<Item>;
  /**
   * The wrap method will wrap the given value in a collection.
   */
  wrap<T>(value: T | T[] | Collection<T>): Collection<T>;
  /**
   * The zip method merges together the values of the given array with the values
   * of the original collection at the corresponding index.
   */
  zip<T>(array: T[] | Collection): Collection<[Item, T]>;
  [Symbol.iterator](): Iterator<Item>;
}
declare const collect: <Item = any>(collection?: Record<string, Item> | Item[] | Item) => Collection<Item>;
//#endregion
//#region src/utilities/filters.d.ts
declare function falsyValue<X$1>(item: X$1): boolean;
declare function filterObject(func?: (...args: any[]) => any, items?: Record<string, any>): Record<string, any>;
declare function filterArray(func?: (...args: any[]) => any, items?: Record<string, any>): any;
//#endregion
//#region src/utilities/is.d.ts
type X = any;
declare const isArray: <K>(item: X) => item is K[];
declare const isObject: <K>(item: X) => item is Record<string, K>;
declare const isFunction: (item: X) => item is ((...args: any[]) => any);
//#endregion
//#region src/utilities/values.d.ts
declare const inspect: (thing: any) => string;
//#endregion
export { Collection, collect, falsyValue, filterArray, filterObject, inspect, isArray, isFunction, isObject };
//# sourceMappingURL=index.d.ts.map