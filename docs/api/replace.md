# `replace()`

The replace method behaves similarly to merge; however, in addition to overwriting matching items with string keys, the replace method will also overwrite items in the collection that have matching numeric keys:

```js
const collection = collect({
  name: 'Bob',
});

const replaced = collection.replace({
  name: 'John',
  number: 45,
});

replaced.all();

// {
//   name: 'John',
//   number: 45,
// }
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20replace&type=code)
