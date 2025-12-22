# `whereInstanceOf()`

The whereInstanceOf method filters the collection by a given class type:

```js
const collection = collect([
  new Player('Firmino'),
  new Player('Salah'),
  new Manager('Klopp'),
]);

const filtered = collection.whereInstanceOf(Player);

filtered.all();

// [
//   new Player('Firmino'),
//   new Player('Salah'),
// ]
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20whereInstanceOf&type=code)
