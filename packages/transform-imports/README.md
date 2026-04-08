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

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/transform-imports](https://github.com/swc-project/plugins/tree/main/packages/transform-imports) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
