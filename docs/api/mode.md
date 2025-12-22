# `mode()`

The mode method returns the mode value of a given key:

```js
collect([1, 3, 3, 6, 7, 8, 9]).mode();

// [3]
```

```js
collect([
  {
    foo: 1,
  },
  {
    foo: 1,
  },
  {
    foo: 2,
  },
  {
    foo: 4,
  },
]).mode('foo');

// [1]
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20mode&type=code)
