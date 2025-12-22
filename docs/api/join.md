# `join()`

The join method joins the collection's values with a string:

```js
collect(['a', 'b', 'c']).join(', ');
// 'a, b, c'

collect(['a', 'b', 'c']).join(', ', ', and ');
// 'a, b, and c'

collect(['a', 'b']).join(', ', ' and ');
// 'a and b'

collect(['a']).join(', ', ' and ');
// 'a'

collect([]).join(', ', ' and ');
// ''
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20join&type=code)
