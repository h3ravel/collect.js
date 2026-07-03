# `lazy()`

The lazy method returns a new `LazyCollection` instance from the underlying array of items.

A lazy collection is backed by a generator, so operations such as `map`, `filter` and `take` are only
evaluated as items are pulled — one at a time. This lets you work with very large, or even infinite,
data sets while keeping memory usage low, just like Laravel's `LazyCollection`.

```js
const collection = collect([1, 2, 3, 4, 5]);

collection
  .lazy()
  .filter((number) => number % 2 === 0)
  .map((number) => number * 10)
  .all();

// [20, 40]
```

You may also create a lazy collection directly from a generator function using `LazyCollection.make`.
Because values are pulled on demand, `take` short-circuits and never exhausts an infinite source:

```js
import { LazyCollection } from '@h3ravel/collect.js';

LazyCollection
  .make(function* () {
    let number = 1;
    while (true) {
      yield number++;
    }
  })
  .filter((number) => number % 3 === 0)
  .take(2)
  .all();

// [3, 6] — only the first 6 values were ever generated
```

Call `eager()` to convert a lazy collection back into a regular `Collection`.

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20lazy&type=code)
