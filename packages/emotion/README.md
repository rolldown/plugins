# @rolldown/plugin-emotion [![npm](https://img.shields.io/npm/v/@rolldown/plugin-emotion.svg)](https://npmx.dev/package/@rolldown/plugin-emotion)

Rolldown plugin for minification and optimization of [Emotion](https://emotion.sh/) styles.

This plugin utilizes Rolldown's [native magic string API](https://rolldown.rs/in-depth/native-magic-string) instead of Babel and is more performant than using [`@emotion/babel-plugin`](https://emotion.sh/docs/@emotion/babel-plugin) with [`@rolldown/plugin-babel`](https://npmx.dev/package/@rolldown/plugin-babel).

## Install

```bash
pnpm add -D @rolldown/plugin-emotion
```

## Usage

```js
import emotion from '@rolldown/plugin-emotion'

export default {
  plugins: [
    emotion({
      // options
    }),
  ],
}
```

### Supported Libraries

The plugin handles imports from these Emotion packages out of the box:

- `@emotion/css`
- `@emotion/styled`
- `@emotion/react`
- `@emotion/primitives`
- `@emotion/native`

## Options

### `sourceMap`

- **Type:** `boolean`
- **Default:** `true` in development, `false` otherwise

Generate source maps for Emotion CSS. Source maps help trace styles back to their original source in browser DevTools.

### `autoLabel`

- **Type:** `'never' | 'dev-only' | 'always'`
- **Default:** `'dev-only'`

Controls when debug labels are added to styled components and `css` calls.

- `'never'` — Never add labels
- `'dev-only'` — Only add labels in development mode
- `'always'` — Always add labels

### `labelFormat`

- **Type:** `string`
- **Default:** `"[local]"`

Defines the format of generated debug labels. Only relevant when `autoLabel` is not `'never'`.

Supports placeholders:

- `[local]` — The variable name that the result of `css` or `styled` call is assigned to
- `[filename]` — The file name (without extension)
- `[dirname]` — The directory name of the file

```js
emotion({
  autoLabel: 'always',
  labelFormat: '[dirname]--[filename]--[local]',
})
```

### `importMap`

- **Type:** `Record<string, ImportMapConfig>`

Custom import mappings for non-standard Emotion packages. Maps package names to their export configurations, allowing the plugin to transform custom libraries that re-export Emotion utilities.

```js
emotion({
  importMap: {
    'my-emotion-lib': {
      myStyled: {
        canonicalImport: ['@emotion/styled', 'default'],
      },
      myCss: {
        canonicalImport: ['@emotion/react', 'css'],
      },
    },
  },
})
```

Each entry maps an export name to its canonical Emotion equivalent via `canonicalImport: [packageName, exportName]`.

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/emotion](https://github.com/swc-project/plugins/tree/main/packages/emotion) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
