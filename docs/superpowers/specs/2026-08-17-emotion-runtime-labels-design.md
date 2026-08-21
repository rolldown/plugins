# Emotion Runtime Labels

## Goal

Add `autoLabel: 'runtime'` to `@rolldown/plugin-emotion`. Generated labels remain present in development builds and are omitted when `process.env.NODE_ENV === "production"` at runtime.

## Output

Styled-component option objects keep their generated target and conditionally spread the label:

```js
{
  target: "emddiua0",
  ...(process.env.NODE_ENV === "production" ? {} : { label: "UI-StyledButton" })
}
```

For `css` and `keyframes` calls, the generated label argument is conditionally spread as zero or one arguments. Production therefore omits the argument instead of passing an empty string or `undefined`. Existing source-map arguments remain unchanged.

## Compatibility

The existing `never`, `dev-only`, and `always` modes retain their current behavior. `runtime` does not depend on build-tool mode detection because its condition is emitted into transformed code.

## Implementation

Extend the public option type and documentation with `runtime`. Centralize generation of conditional label fragments so all styled syntaxes and `css`/`keyframes` paths use consistent output while retaining their existing target, comma, and source-map handling.

## Testing

Add one raw-transform fixture for `autoLabel: 'runtime'` that exercises styled tagged templates, styled object calls, `css`, and `keyframes`. The snapshot verifies the emitted conditional syntax directly.

Run the Emotion package tests, type checks, and formatting or lint checks available in the repository.
