# `pipe()`

The pipe method passes the collection to the given callback and returns the result:

```js
const collection = collect([1, 2, 3]);

const piped = collection.pipe((items) => items.sum());

// 6
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20pipe&type=code)
