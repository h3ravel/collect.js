# `pull()`

The pull method removes and returns an item from the collection by its key:

```js
const collection = collect({
  firstname: 'Michael',
  lastname: 'Cera',
});

collection.pull('lastname');

// Cera

collection.all();

// { firstname: 'Michael' }
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/pull.js)
