# Usage

## JavaScript

```js
// Using require
const collect = require('@h3ravel/collect.js');

collect(products).where('price', '>', 299).sortBy('brand');
```

```js
// Using import
import collect from '@h3ravel/collect.js';

collect(products).where('price', '>', 299).sortBy('brand');
```

```js
// Using the underlying class
import { Collection } from '@h3ravel/collect.js';

new Collection(products).where('price', '>', 299).sortBy('brand');
```

## TypeScript

```ts
import collect from '@h3ravel/collect.js';

collect(products).where('price', '>', 299).sortBy('brand');
```
