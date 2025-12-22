# `containsOneItem()`

The containsOneItem method returns true if the collection contains exactly one item; otherwise, false is returned:

```js
collect([1]).containsOneItem();
// true

collect({ firstname: 'Luis' }).containsOneItem();
// true

collect('value').containsOneItem();
// true

collect([1, 2, 3]).containsOneItem();
//  false

collect({ firstname: 'Luis', lastname: 'Díaz' }).containsOneItem();
// false

collect().containsOneItem();
// false

collect([]).containsOneItem();
// false

collect({}).containsOneItem();
// false
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20containsOneItem&type=code)
