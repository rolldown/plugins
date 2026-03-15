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

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/styled-jsx](https://github.com/swc-project/plugins/tree/main/packages/styled-jsx) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
