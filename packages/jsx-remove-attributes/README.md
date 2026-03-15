# @rolldown/plugin-jsx-remove-attributes [![npm](https://img.shields.io/npm/v/@rolldown/plugin-jsx-remove-attributes.svg)](https://npmx.dev/package/@rolldown/plugin-jsx-remove-attributes)

Rolldown plugin to remove JSX attributes (e.g. `data-testid`).

This plugin is similar to [`babel-plugin-react-remove-properties`](https://github.com/oliviertassinari/babel-plugin-react-remove-properties) but uses Rolldown's native AST parser and [native magic string API](https://rolldown.rs/in-depth/native-magic-string) instead of Babel, making it faster and requiring no additional dependencies.

## Install

```bash
pnpm add -D @rolldown/plugin-jsx-remove-attributes
```

## Usage

```js
import jsxRemoveAttributes from '@rolldown/plugin-jsx-remove-attributes'

export default {
  plugins: [
    jsxRemoveAttributes({
      // options
    }),
  ],
}
```

### Example

**In**

```jsx
export default function Home() {
  return (
    <div data-test-id="1" data-custom="1a">
      <div data-custom="2">
        <h1 data-testid="3">Hello World!</h1>
      </div>
    </div>
  )
}
```

**Out** (with default options)

```jsx
export default function Home() {
  return (
    <div data-custom="1a">
      <div data-custom="2">
        <h1>Hello World!</h1>
      </div>
    </div>
  )
}
```

Attributes matching `/^data-test/` (`data-test-id` and `data-testid`) are removed, while `data-custom` is preserved.

## Options

### `attributes`

- **Type:** `Array<string | RegExp>`
- **Default:** `[/^data-test/]`

Patterns to match JSX attribute names to remove. Strings are exact matches.

```js
jsxRemoveAttributes({
  attributes: [/^data-test/, 'data-custom'],
})
```

## Benchmark

Results of the benchmark that can be run by `pnpm bench` in `./benchmark` directory:

```
  name                                         hz      min     max     mean      p75     p99    p995    p999     rme  samples
· @rolldown/plugin-jsx-remove-attributes  12.9805  72.0620  107.49  77.0388  74.7614  107.49  107.49  107.49  ±9.99%       10
· @rolldown/plugin-babel                   5.1662   183.08  223.91   193.56   197.79  223.91  223.91  223.91  ±5.22%       10
· @rollup/plugin-swc                      11.3756  82.0540  111.68  87.9076  87.6005  111.68  111.68  111.68  ±6.98%       10

@rolldown/plugin-jsx-remove-attributes - bench/jsx-remove-attributes.bench.ts > JSX Remove Attributes Benchmark
  1.14x faster than @rollup/plugin-swc
  2.51x faster than @rolldown/plugin-babel
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

The implementation is based on [swc-project/plugins/packages/react-remove-properties](https://github.com/swc-project/plugins/tree/main/packages/react-remove-properties) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
