# @rolldown/oxc-unshadowed-visitor

Scope-aware AST visitor that tracks references to specified names, filtering out those shadowed by local bindings. Performs single-pass analysis using Rolldown's built-in AST visitor.

> **Note:** This is a private internal package used by other `@rolldown` plugins. It is not published to npm.

## Usage

```ts
import { parseSync } from 'rolldown/utils'
import { ScopedVisitor } from '@rolldown/oxc-unshadowed-visitor'

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

## How it works

`ScopedVisitor` walks the AST once and maintains a scope stack internally. When your visitor calls `ctx.record()`, the record is kept only if the tracked name is not shadowed at that point. If a later `var` declaration hoists into scope, previously recorded references are retroactively invalidated.
