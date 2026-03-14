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

## License

MIT

## Credits

The implementation is based on [swc-project/plugins/packages/react-remove-properties](https://github.com/swc-project/plugins/tree/main/packages/react-remove-properties) ([Apache License 2.0](https://github.com/swc-project/plugins/blob/main/LICENSE)). Test cases are also adapted from it.
