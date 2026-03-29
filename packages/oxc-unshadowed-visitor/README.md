# oxc-unshadowed-visitor [![npm](https://img.shields.io/npm/v/oxc-unshadowed-visitor.svg)](https://npmx.dev/package/oxc-unshadowed-visitor)

Scope-aware AST visitor that tracks references to specified names, filtering out those shadowed by local bindings. Performs single-pass analysis using Rolldown's built-in AST visitor.

## Install

```bash
pnpm add -D oxc-unshadowed-visitor
```

## Usage

```ts
import { parseSync } from 'rolldown/utils'
import { ScopedVisitor } from 'oxc-unshadowed-visitor'

const program = parseSync('app.tsx', code).program

const sv = new ScopedVisitor<string>({
  trackedNames: ['React'],
  visitor: {
    Identifier(node, ctx) {
      if (node.name === 'React') {
        ctx.record({ name: node.name, node, data: 'jsx-ref' })
      }
    },
  },
})

const records = sv.walk(program)
// records contains only references where `React` is NOT shadowed
```

## API

### `ScopedVisitor<T>`

Main class that walks the AST once and maintains a scope stack internally. When your visitor calls `ctx.record()`, the record is kept only if the tracked name is not shadowed at that point. If a later `var` declaration hoists into scope, previously recorded references are retroactively invalidated.

#### `new ScopedVisitor(options)`

- **`options.trackedNames`** — `string[]` — Names to track for shadowing.
- **`options.visitor`** — `ScopedVisitorObject<T>` — Visitor object with handlers that receive the AST node and a `VisitorContext<T>`.

#### `sv.walk(program): TransformRecord<T>[]`

Walks the given `ESTree.Program` and returns an array of records that were not shadowed.

### `VisitorContext<T>`

- **`record(opts: { name: string; node: object; data: T })`** — Records a reference. The record is automatically filtered out if the name is shadowed at the call site.

### `TransformRecord<T>`

```ts
interface TransformRecord<T> {
  name: string
  node: object
  data: T
}
```

## License

MIT
