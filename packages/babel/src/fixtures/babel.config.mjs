import identifierReplacePlugin from './identifier-replace-plugin.mjs'

export default {
  plugins: [[identifierReplacePlugin, { name: 'foo', value: true }]],
}
