# `intersect()`

The intersect method removes any values from the original collection that are not present in the given `array` or `collection`. The resulting collection will preserve the original collection's keys:

```js
const collection = collect([1, 2, 3, 4, 5]);

intersect = collection.intersect([1, 2, 3, 9]);

intersect.all();

// [1, 2, 3]
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/intersect.js)
