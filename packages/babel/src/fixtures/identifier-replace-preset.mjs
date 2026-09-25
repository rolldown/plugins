import identifierReplacePlugin from './identifier-replace-plugin.mjs'

export default function identifierReplacePreset(_api, options) {
  return { plugins: [[identifierReplacePlugin, options]] }
}
