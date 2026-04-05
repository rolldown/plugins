# @rolldown/plugin-styled-jsx [![npm](https://img.shields.io/npm/v/@rolldown/plugin-styled-jsx.svg)](https://npmx.dev/package/@rolldown/plugin-styled-jsx)

Rolldown plugin for [styled-jsx](https://github.com/vercel/styled-jsx) CSS scoping.

This plugin utilizes Rolldown's [native magic string API](https://rolldown.rs/in-depth/native-magic-string) instead of Babel and is more performant than using [`styled-jsx/babel`](https://github.com/vercel/styled-jsx#getting-started) with [`@rolldown/plugin-babel`](https://npmx.dev/package/@rolldown/plugin-babel).

## Install

```bash
pnpm add -D @rolldown/plugin-styled-jsx
```

## Usage

```js
import styledJsx from '@rolldown/plugin-styled-jsx'

export default {
  plugins: [
    styledJsx({
      // options
    }),
  ],
}
```

## Options

### `browsers`

- **Type:** [`Targets`](https://lightningcss.dev/transpilation.html#browser-targets) (from `lightningcss`)
- **Default:** `undefined`

Target browser versions for CSS transpilation. See the [lightningcss documentation](https://lightningcss.dev/transpilation.html#browser-targets) for details.

```js
styledJsx({
  browsers: {
    chrome: 95 << 16,
    firefox: 90 << 16,
  },
})
```

### `sourceMap`

- **Type:** `boolean`
- **Default:** `true` in development, `false` otherwise

Generates inline source maps for scoped CSS, allowing browser DevTools to map styles back to where they are defined in the source file.

```js
styledJsx({
  sourceMap: true,
})
```

## Benchmark

Results of the benchmark that can be run by `pnpm bench` in `./benchmark` directory:

```
  name                              hz      min      max     mean      p75      p99     p995     p999     rme  samples
· @rolldown/plugin-styled-jsx  10.9402  89.9217  96.5430  91.4056  91.2763  96.5430  96.5430  96.5430  ±1.49%       10
· @rolldown/plugin-babel        4.3779   223.52   238.96   228.42   230.16   238.96   238.96   238.96  ±1.65%       10
· @rollup/plugin-swc            9.4885   103.62   109.31   105.39   105.83   109.31   109.31   109.31  ±1.11%       10

@rolldown/plugin-styled-jsx - bench/styled-jsx.bench.ts > Styled JSX Benchmark
  1.15x faster than @rollup/plugin-swc
  2.50x faster than @rolldown/plugin-babel
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

The implementation is based on [swc-project/plugins/packages/styled-jsx](https://github.com/swc-project/plugins/tree/main/packages/styled-jsx) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
