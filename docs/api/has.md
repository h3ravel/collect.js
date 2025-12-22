# `has()`

The has method determines if one or more keys exists in the collection:

```js
const collection = collect({
  animal: 'unicorn',
  ability: 'magical',
});

collection.has('ability');

// true

collection.has(['animal', 'ability']);

// true

collection.has(['animal', 'ability', 'name']);

// false
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20has&type=code)
