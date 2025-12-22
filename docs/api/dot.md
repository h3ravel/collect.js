# `dot()`

The dot method allows accessing objects using the dot notation.

```js
collect({
  name: 'Taylor',
  meta: {
    foo: 'bar',
    baz: ['boom', 'boom', 'boom'],
    bam: {
      boom: 'bip',
    },
  },
})
  .dot()
  .all();

// {
//   name: 'Taylor',
//   'meta.foo': 'bar',
//   'meta.baz': ['boom', 'boom', 'boom'],
//   'meta.bam.boom': 'bip',
// }
```

[View source on GitHub](https://github.com/search?q=repo%3Ah3ravel/collect.js%20dot&type=code)
