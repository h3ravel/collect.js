# `whereNull()`

The `whereNull` method filters items where the given key is null.

```js
const collection = collect([
  {
    name: 'Mohamed Salah',
  },
  {
    name: null,
  },
  {
    name: 'Darwin Núñez',
  },
]);

const filtered = collection.whereNull();

filtered.all();

// [
//   { name: null },
// ]
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/whereNull.js)
