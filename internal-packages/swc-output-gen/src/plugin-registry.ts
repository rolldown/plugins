/**
 * Plugin registry that maps our plugin names to their original SWC packages
 * and provides option mappers for transforming fixture configs to SWC plugin options.
 */

export interface MapOptionsContext {
  /** Path to the fixture directory */
  fixtureDir: string
}

export interface PluginConfig {
  /** Name of the original SWC plugin package(s) */
  packages: string[]
  /** Map fixture config to SWC plugin options. Returns array of [package, options] tuples */
  mapOptions: (
    config: Record<string, unknown>,
    ctx: MapOptionsContext,
  ) => Array<[string, Record<string, unknown>]>
  /** Whether to skip this fixture based on config and context */
  shouldSkip?: (config: Record<string, unknown>, ctx: MapOptionsContext) => boolean
}

export const pluginRegistry: Record<string, PluginConfig> = {
  emotion: {
    packages: ['@swc/plugin-emotion'],
    mapOptions: (config) => [['@swc/plugin-emotion', config]],
    shouldSkip: () => false,
  },
  'jsx-remove-attributes': {
    packages: ['@swc/plugin-react-remove-properties'],
    mapOptions: (config) => {
      const swcConfig: Record<string, unknown> = {}
      if (config.attributes) {
        swcConfig.properties = config.attributes
      }
      return [['@swc/plugin-react-remove-properties', swcConfig]]
    },
  },
  'styled-jsx': {
    packages: ['@swc/plugin-styled-jsx'],
    mapOptions: (config) => {
      const swcConfig = {
        useLightningcss: true,
        ...config,
      }
      return [['@swc/plugin-styled-jsx', swcConfig]]
    },
  },
}

/** Get list of all supported plugin names */
export function getPluginNames(): string[] {
  return Object.keys(pluginRegistry)
}

/** Get plugin config by name, extracting from package directory name */
export function getPluginFromDirectory(dirName: string): string | undefined {
  // Directory name is the plugin name directly (e.g., "emotion")
  if (pluginRegistry[dirName]) return dirName

  // Also support "plugin-*" naming convention
  const match = dirName.match(/^plugin-(.+)$/)
  if (!match) return undefined

  const pluginName = match[1]
  return pluginRegistry[pluginName] ? pluginName : undefined
}
