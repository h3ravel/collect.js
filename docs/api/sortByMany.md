# `sortByMany()`

The sortByMany method sorts the collection by the given key. The sorted collection keeps the original array keys, so in this example we'll use the values method to reset the keys to consecutively numbered indexes:

```js
const collection = collect([
  { name: 'Desk', colors: ['Black', 'Mahogany'] },
  { name: 'Chair', colors: ['Black'] },
  { name: 'Bookcase', colors: ['Red', 'Beige', 'Brown'] },
]);

const sorted = collection.sortByMany([(product, key) => product.colors.length]);

sorted.all();

// [
//   { name: 'Chair', colors: ['Black'] },
//   { name: 'Desk', colors: ['Black', 'Mahogany'] },
//   { name: 'Bookcase', colors: ['Red', 'Beige', 'Brown'] },
// ]
```

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/sortByMany.js)
