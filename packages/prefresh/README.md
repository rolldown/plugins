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

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/prefresh](https://github.com/swc-project/plugins/tree/main/packages/prefresh) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
