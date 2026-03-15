# @rolldown/plugin-react-signals-transform [![npm](https://img.shields.io/npm/v/@rolldown/plugin-react-signals-transform.svg)](https://npmx.dev/package/@rolldown/plugin-react-signals-transform)

Rolldown plugin for [`@preact/signals-react-transform`](https://www.npmjs.com/package/@preact/signals-react-transform).

It applies the Signals React transform during Rolldown builds so React components and hooks can automatically subscribe to signal reads without wiring Babel up manually.

## Install

```bash
pnpm add -D @rolldown/plugin-react-signals-transform
pnpm add react @preact/signals-react
```

## Usage

```ts
import reactSignalsTransform from '@rolldown/plugin-react-signals-transform'

export default {
  plugins: [
    reactSignalsTransform({
      mode: 'auto',
    }),
  ],
}
```

## Options

This plugin forwards the same options as `@preact/signals-react-transform`:

- `mode`
- `importSource`
- `detectTransformedJSX`
- `experimental`

Example:

```ts
reactSignalsTransform({
  detectTransformedJSX: true,
  experimental: {
    debug: true,
  },
})
```

## Notes

- Run it before other JSX transforms.
- The generated code imports `useSignals` from `@preact/signals-react/runtime` by default.
- When your code is already compiled to `react/jsx-runtime` or `React.createElement`, enable `detectTransformedJSX`.

## License

MIT

## Credits

The transform logic is adapted from [`packages/react-transform`](https://github.com/preactjs/signals/tree/main/packages/react-transform) in the Preact Signals repository. The test cases are ported from the same package.
