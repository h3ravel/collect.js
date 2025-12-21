# `all()`

The all method returns the underlying array or object represented by the collection:

```js
collect([1, 2, 3]).all();

// [1, 2, 3]
```

```js
collect({
  firstname: 'Darwin',
  lastname: 'Núñez',
}).all();

// {
//   firstname: 'Darwin',
//   lastname: 'Núñez',
// }
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/all.js)
