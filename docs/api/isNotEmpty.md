# `isNotEmpty()`

The isNotEmpty method returns true if the collection is not empty; otherwise, false is returned:

```js
collect([1, 2, 3]).isNotEmpty();
//  true

collect().isNotEmpty();
// false

collect([]).isNotEmpty();
// false

collect({}).isNotEmpty();
// false
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20isNotEmpty&type=code)
