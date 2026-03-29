<p align="center">
  <br>
  <br>
  <a href="https://rolldown.rs" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://rolldown.rs/rolldown-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://rolldown.rs/rolldown-dark.svg">
      <img alt="rolldown logo" src="https://rolldown.rs/rolldown-dark.svg" height="60">
    </picture>
  </a>
  <br>
  <br>
  <br>
</p>

# Rolldown Plugins

Official Rolldown plugins

## Packages

### Plugin Packages

- [`@rolldown/plugin-babel`](https://github.com/rolldown/plugins/tree/main/packages/babel) ([![NPM version][badge-npm-version-babel]][url-npm-babel]): transform code with Babel
- [`@rolldown/plugin-emotion`](https://github.com/rolldown/plugins/tree/main/packages/emotion) ([![NPM version][badge-npm-version-emotion]][url-npm-emotion]): minification and optimization of Emotion styles
- [`@rolldown/plugin-jsx-remove-attributes`](https://github.com/rolldown/plugins/tree/main/packages/jsx-remove-attributes) ([![NPM version][badge-npm-version-jsx-remove-attributes]][url-npm-jsx-remove-attributes]): remove JSX attributes (e.g. data-testid)

### Other Packages

- [`oxc-unshadowed-visitor`](https://github.com/rolldown/plugins/tree/main/packages/oxc-unshadowed-visitor) ([![NPM version][badge-npm-version-oxc-unshadowed-visitor]][url-npm-oxc-unshadowed-visitor]): scope-aware AST visitor that tracks references to specified names, filtering out those shadowed by local bindings

## License

[MIT](https://github.com/rolldown/plugins/blob/main/LICENSE)

[badge-npm-version-babel]: https://img.shields.io/npm/v/@rolldown/plugin-babel/latest?color=brightgreen
[badge-npm-version-emotion]: https://img.shields.io/npm/v/@rolldown/plugin-emotion/latest?color=brightgreen
[badge-npm-version-jsx-remove-attributes]: https://img.shields.io/npm/v/@rolldown/plugin-jsx-remove-attributes/latest?color=brightgreen
[badge-npm-version-oxc-unshadowed-visitor]: https://img.shields.io/npm/v/oxc-unshadowed-visitor/latest?color=brightgreen
[url-npm-babel]: https://npmx.dev/package/@rolldown/plugin-babel/v/latest
[url-npm-emotion]: https://npmx.dev/package/@rolldown/plugin-emotion/v/latest
[url-npm-jsx-remove-attributes]: https://npmx.dev/package/@rolldown/plugin-jsx-remove-attributes/v/latest
[url-npm-oxc-unshadowed-visitor]: https://npmx.dev/package/oxc-unshadowed-visitor/v/latest
