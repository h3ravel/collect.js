# `flip()`

The flip method swaps the collection's keys with their corresponding values:

```js
const collection = collect({
  name: 'Darwin Núñez',
  number: 27,
});

const flipped = collection.flip();

flipped.all();

// {
//   'Darwin Núñez': 'name',
//   '27': 'number',
// }
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20flip&type=code)
