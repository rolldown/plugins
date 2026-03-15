export interface RelayPluginOptions {
  /**
   * The language used for generated artifacts.
   * @default 'javascript'
   */
  language?: 'typescript' | 'javascript'
  /**
   * Use ES module imports instead of require().
   * @default true
   */
  eagerEsModules?: boolean
  /**
   * Override the file extension used for artifact imports.
   * Takes precedence over language.
   */
  outputFileExtension?: 'typescript' | 'javascript'
  /**
   * Custom artifact directory (relative to rootDir).
   */
  artifactDirectory?: string
  /**
   * Multi-project configuration.
   */
  projects?: ProjectConfig[]
}

export interface ProjectConfig {
  rootDir: string
  artifactDirectory?: string
}

export interface CompiledProjectConfig {
  rootDir: string
  artifactDirectory?: string
}
