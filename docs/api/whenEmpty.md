# `whenEmpty()`

The `whenEmpty` method will execute the given callback when the collection is empty:

```js
const collection = collect([]);

collection.whenEmpty((c) => c.push('Mohamed Salah'));

collection.all();

// ['Mohamed Salah']
```

```js
const collection = collect(['Darwin Núñez']);

collection.whenEmpty(
  (c) => c.push('Mohamed Salah'),
  (c) => c.push('Xherdan Shaqiri')
);

collection.all();

// [
//   'Darwin Núñez',
//   'Xherdan Shaqiri',
// ];
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20whenEmpty&type=code)
