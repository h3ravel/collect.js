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

[View source on GitHub](https://github.com/h3ravel/collect.js/blob/main/src/methods/dot.js)
