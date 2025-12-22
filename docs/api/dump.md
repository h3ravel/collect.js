# `dump()`

The dump method outputs the results at that moment and then continues processing:

```js
collect([1, 2, 3, 4])
  .dump()
  .map((item) => item * 2)
  .dump();

// Collection { items: [ 1, 2, 3, 4 ] }
// Collection { items: [ 2, 4, 6, 8 ] }
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20dump&type=code)
