# @rolldown/plugin-prefresh [![npm](https://img.shields.io/npm/v/@rolldown/plugin-prefresh.svg)](https://npmx.dev/package/@rolldown/plugin-prefresh)

Rolldown plugin for [Prefresh](https://github.com/preactjs/prefresh) (HMR support for [Preact](https://github.com/preactjs/preact)).

This plugin memoizes `createContext()` calls to preserve context identity across hot module replacement cycles. It utilizes Rolldown's [native magic string API](https://rolldown.rs/in-depth/native-magic-string) instead of Babel and is more performant than using `@prefresh/babel-plugin` with [`@rolldown/plugin-babel`](https://npmx.dev/package/@rolldown/plugin-babel).

This plugin is meant to be used together with the React refresh transform in Oxc.

## Install

```bash
pnpm add -D @rolldown/plugin-prefresh
```

## Usage

```js
import prefresh from '@rolldown/plugin-prefresh'

export default {
  plugins: [
    prefresh({
      // options
    }),
  ],
}
```

## Options

### `library`

- **Type:** `string[]`
- **Default:** `['preact', 'react', 'preact/compat']`

Libraries to detect `createContext` imports from. Override this to add or restrict which packages are scanned.

```js
prefresh({
  library: ['preact', 'preact/compat'],
})
```

### `enabled`

- **Type:** `boolean`
- **Default:** `true` in development, `false` otherwise

Enable or disable the transform. When used with Vite, the plugin automatically detects the environment. When used with Rolldown directly, it checks `process.env.NODE_ENV`.

## Benchmark

Results of the benchmark that can be run by `pnpm bench` in `./benchmark` directory:

```
name                           hz     min     max    mean     p75     p99    p995    p999     rme  samples
· @rolldown/plugin-prefresh  7.7340  123.59  140.14  129.30  129.53  140.14  140.14  140.14  ±2.57%       10
· @rolldown/plugin-babel     3.6874  254.66  374.95  271.19  263.76  374.95  374.95  374.95  ±9.70%       10
· @rollup/plugin-swc         6.7767  143.32  166.00  147.56  146.57  166.00  166.00  166.00  ±3.17%       10

@rolldown/plugin-prefresh - bench/prefresh.bench.ts > Prefresh Benchmark
  1.14x faster than @rollup/plugin-swc
  2.10x faster than @rolldown/plugin-babel
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

The implementation is based on [swc-project/plugins/packages/prefresh](https://github.com/swc-project/plugins/tree/main/packages/prefresh) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
