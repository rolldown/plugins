# @rolldown/plugin-transform-imports [![npm](https://img.shields.io/npm/v/@rolldown/plugin-transform-imports.svg)](https://npmx.dev/package/@rolldown/plugin-transform-imports)

Rolldown plugin for transforming imports and re-exports from barrel files into individual module imports. This improves performance by avoiding resolving all of imports in the barrel file. For example, it rewrites `import { map } from "lodash"` with `import map from "lodash/map"`.

## Install

```bash
pnpm add -D @rolldown/plugin-transform-imports
```

## Usage

```js
import transformImports from '@rolldown/plugin-transform-imports'

export default {
  plugins: [
    transformImports({
      modules: {
        lodash: {
          transform: 'lodash/{{member}}',
        },
      },
    }),
  ],
}
```

This transforms:

```js
import { map, filter } from 'lodash'
```

Into:

```js
import map from 'lodash/map'
import filter from 'lodash/filter'
```

## Options

### `modules`

- **Type:** `Record<string, TransformConfig>`

A map of module names (or regex patterns) to their transform configuration.

Module names are converted to regex patterns: `lodash` matches exactly `lodash`, while `^lodash(/.*)?$` allows custom regex patterns (must start with `^` and end with `$`).

## TransformConfig

### `transform`

- **Type:** `string | [pattern: string, template: string][]`
- **Required**

The path template for transformed imports. Use `{{member}}` as a placeholder for the imported member name.

**String form:**

```js
{
  transform: 'lodash/{{member}}'
}
// import { map } from 'lodash' → import map from 'lodash/map'
```

**Array of tuples form** for pattern-based routing:

```js
{
  transform: [
    ['someFunc', 'some-lib/some-module'],
    ['*', 'some-lib/{{member}}'],
  ]
}
```

Each tuple is `[pattern, template]`. Patterns are treated as regex (except `*` which matches anything). The first matching pattern wins.

### `preventFullImport`

- **Type:** `boolean`
- **Default:** `false`

When `true`, throws an error on namespace imports (`import * as X`) and side-effect imports (`import 'mod'`).

### `skipDefaultConversion`

- **Type:** `boolean`
- **Default:** `false`

When `true`, keeps the import as a named import instead of converting to a default import:

```js
// skipDefaultConversion: false (default)
import { map } from 'lodash'
import map from 'lodash/map' // output

// skipDefaultConversion: true
import { map } from 'lodash'
import { map } from 'lodash/map' // output
```

### `handleDefaultImport`

- **Type:** `boolean`
- **Default:** `false`

When `true`, transforms default imports using the local name as the member:

```js
// handleDefaultImport: true
import myMap from 'lodash'
import myMap from 'lodash/myMap' // output
```

### `handleNamespaceImport`

- **Type:** `boolean`
- **Default:** `false`

When `true`, transforms namespace imports using the local name as the member:

```js
// handleNamespaceImport: true
import * as myMap from 'lodash'
import * as myMap from 'lodash/myMap' // output
```

## Template Syntax

Templates use `{{...}}` placeholders with the following variables:

### Variables

- **`{{member}}`** — the imported member name
- **`{{matches.[N]}}`** — capture group from the module name regex
- **`{{memberMatches.[N]}}`** — capture group from the member pattern (tuple form only)

### Case Transforms

Apply a case transform by prefixing the variable:

- **`{{camelCase member}}`** — `MyComponent` → `myComponent`
- **`{{kebabCase member}}`** — `MyComponent` → `my-component`
- **`{{snakeCase member}}`** — `MyComponent` → `my_component`
- **`{{upperCase member}}`** — `map` → `MAP`

### Example with regex capture groups

```js
{
  modules: {
    '^my-lib/(.+)$': {
      transform: 'my-lib/dist/{{matches.[1]}}/{{kebabCase member}}',
    },
  },
}
// import { MyButton } from 'my-lib/components'
// → import MyButton from 'my-lib/dist/components/my-button'
```

## Re-exports

The plugin also transforms re-exports:

```js
// input
export { map, filter } from 'lodash'
// output
export { default as map } from 'lodash/map'
export { default as filter } from 'lodash/filter'
```

With `skipDefaultConversion: true`:

```js
// input
export { map, filter } from 'lodash'
// output
export { map } from 'lodash/map'
export { filter } from 'lodash/filter'
```

## Dynamic Imports

Static dynamic imports are also transformed:

```js
const mod = await import('lodash')
// source is rewritten based on the transform template
```

## Benchmark

Results of the benchmark that can be run by `pnpm bench` in `./benchmark` directory:

```
  name                                     hz      min      max     mean      p75      p99     p995     p999     rme  samples
· @rolldown/plugin-transform-imports  14.9081  65.9831  69.8849  67.0775  67.5907  69.8849  69.8849  69.8849  ±1.29%       10
· babel-plugin-transform-imports       5.1254   184.90   246.64   195.11   191.14   246.64   246.64   246.64  ±6.84%       10
· @swc/plugin-transform-imports       10.9555  88.5649  98.1298  91.2780  92.9843  98.1298  98.1298  98.1298  ±2.50%       10

@rolldown/plugin-transform-imports - bench/transform-imports.bench.ts > Transform Imports Benchmark
  1.36x faster than @swc/plugin-transform-imports
  2.91x faster than babel-plugin-transform-imports
```

The benchmark was ran on the following environment:

```
OS: macOS Tahoe 26.3
CPU: Apple M4
Memory: LPDDR5X-7500 32GB
```

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/transform-imports](https://github.com/swc-project/plugins/tree/main/packages/transform-imports) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
