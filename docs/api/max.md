# `max()`

The max method returns the maximum value of a given key:

```js
const collection = collect([
  {
    value: 10,
  },
  {
    value: -13,
  },
  {
    value: 12,
  },
  {
    unicorn: false,
  },
]);

const max = collection.max('value');

// 12
```

```js
collect([-1, -2345, 12, 11, 3]).max();

// 12
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/max.js)
