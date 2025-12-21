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

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/flip.js)
