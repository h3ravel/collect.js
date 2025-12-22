# `chunk()`

The chunk method breaks the collection into multiple, smaller collections of a given size:

```js
const collection = collect([1, 2, 3, 4, 5, 6, 7]);

const chunks = collection.chunk(4);

chunks.all();

// [[1, 2, 3, 4], [5, 6, 7]]
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20chunk&type=code)
