# `sortKeys()`

The sortKeys method sorts the collection by the keys of the underlying associative array:

```js
const collection = collect({
  id: 10,
  first: 'Darwin',
  last: 'Núñez',
});

const sorted = collection.sortKeys();

sorted.all();

// {
//   first: 'Darwin',
//   id: 10,
//   last: 'Núñez',
// }
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/sortKeys.js)
