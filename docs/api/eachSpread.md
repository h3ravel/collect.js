# `eachSpread()`

The eachSpread method iterates over the collection's items, passing each nested item value into the given callback:

```js
const collection = collect([
  ['John Doe', 35],
  ['Jane Doe', 33],
]);

collection.eachSpread((name, age) => {
  //
});
```

You may stop iterating through the items by returning false from the callback:

```js
collection.eachSpread((name, age) => false);
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20eachSpread&type=code)
