# `min()`

The min method returns the minimum value of a given key:

```js
const collection = collect([
  {
    worth: 100,
  },
  {
    worth: 900,
  },
  {
    worth: 79,
  },
]);

collection.min('worth');

// 79
```

```js
collect([1, 2, 3, 4, 5]).min();

// 1
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20min&type=code)
