/**
 * Generate SWC plugin outputs for comparison with ported plugins.
 *
 * Usage:
 *   pnpm generate:swc-outputs                    # All plugins
 *   pnpm generate:swc-outputs --plugins emotion  # Specific plugin(s)
 *   pnpm generate:swc-outputs --dry-run          # Preview only
 */

import { readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative } from 'node:path'
import { glob } from 'tinyglobby'
import { pluginRegistry, getPluginFromDirectory, getPluginNames } from './plugin-registry.js'
import { transformWithSwc } from './swc-transformer.js'

interface CliOptions {
  plugins: string[]
  dryRun: boolean
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  const options: CliOptions = {
    plugins: [],
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--plugins') {
      // Collect all following non-flag arguments as plugin names
      i++
      while (i < args.length && !args[i].startsWith('--')) {
        options.plugins.push(args[i])
        i++
      }
      i-- // Back up one since the loop will increment
    }
  }

  // Validate plugin names
  const validPlugins = getPluginNames()
  for (const plugin of options.plugins) {
    if (!validPlugins.includes(plugin)) {
      console.error(`Unknown plugin: ${plugin}`)
      console.error(`Available plugins: ${validPlugins.join(', ')}`)
      process.exit(1)
    }
  }

  return options
}

async function discoverFixtures(pluginFilter: string[]): Promise<string[]> {
  const packagesDir = join(import.meta.dirname, '..', '..', '..', 'packages')

  // Find all input files in both fixtures and fixtures-labels directories
  const inputFiles = await glob(
    [
      '*/tests/fixtures/**/input.{js,jsx,ts,tsx}',
      '*/tests/fixtures-labels/*/input.{js,jsx,ts,tsx}',
    ],
    {
      cwd: packagesDir,
      absolute: true,
    },
  )

  // Filter by plugin if specified
  if (pluginFilter.length > 0) {
    return inputFiles.filter((file) => {
      const relativePath = relative(packagesDir, file)
      const pluginDir = relativePath.split('/')[0]
      const pluginName = getPluginFromDirectory(pluginDir)
      return pluginName && pluginFilter.includes(pluginName)
    })
  }

  return inputFiles
}

async function loadConfig(fixtureDir: string): Promise<Record<string, unknown>> {
  const configPath = join(fixtureDir, 'config.json')
  try {
    const content = await readFile(configPath, 'utf-8')
    return JSON.parse(content)
  } catch {
    // Config is optional, default to empty object
    return {}
  }
}

interface ProcessResult {
  fixture: string
  status: 'success' | 'skipped' | 'error'
  message?: string
}

async function processFixture(inputPath: string, dryRun: boolean): Promise<ProcessResult> {
  const fixtureDir = dirname(inputPath)
  const packagesDir = join(import.meta.dirname, '..', '..', '..', 'packages')
  const relativePath = relative(packagesDir, inputPath).replaceAll('\\', '/')
  const pluginDir = relativePath.split('/')[0]
  const pluginName = getPluginFromDirectory(pluginDir)

  if (!pluginName) {
    return {
      fixture: relativePath,
      status: 'skipped',
      message: 'Unknown plugin',
    }
  }

  const pluginConfig = pluginRegistry[pluginName]
  const config = await loadConfig(fixtureDir)

  // Check if we should skip this fixture
  if (pluginConfig.shouldSkip?.(config, { fixtureDir })) {
    return {
      fixture: relativePath,
      status: 'skipped',
      message: 'Fixture uses unsupported options',
    }
  }

  // Map config to SWC plugin options
  const plugins = pluginConfig.mapOptions(config, { fixtureDir })

  if (plugins.length === 0) {
    return {
      fixture: relativePath,
      status: 'skipped',
      message: 'No plugins to apply',
    }
  }

  if (dryRun) {
    return {
      fixture: relativePath,
      status: 'success',
      message: `Would transform with: ${plugins.map(([pkg]) => pkg).join(', ')}`,
    }
  }

  try {
    // Read input file
    const code = await readFile(inputPath, 'utf-8')
    const filename = basename(inputPath)

    // Transform with SWC
    const output = await transformWithSwc(code, {
      filename,
      plugins,
    })

    // Write output
    const outputPath = join(fixtureDir, 'output.swc.js')
    await writeFile(outputPath, output, 'utf-8')

    return {
      fixture: relativePath,
      status: 'success',
    }
  } catch (error) {
    return {
      fixture: relativePath,
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

async function main() {
  const options = parseArgs()

  console.log('Discovering fixtures...')
  const fixtures = await discoverFixtures(options.plugins)

  if (fixtures.length === 0) {
    console.log('No fixtures found.')
    return
  }

  console.log(`Found ${fixtures.length} fixtures.`)
  if (options.dryRun) {
    console.log('(Dry run - no files will be written)\n')
  } else {
    console.log('')
  }

  const results: ProcessResult[] = []

  for (const fixture of fixtures) {
    const result = await processFixture(fixture, options.dryRun)
    results.push(result)

    // Print result
    const icon = result.status === 'success' ? '✓' : result.status === 'skipped' ? '○' : '✗'
    const message = result.message ? ` (${result.message})` : ''
    console.log(`${icon} ${result.fixture}${message}`)
  }

  // Summary
  const success = results.filter((r) => r.status === 'success').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const errors = results.filter((r) => r.status === 'error').length

  console.log(`\nSummary: ${success} success, ${skipped} skipped, ${errors} errors`)

  if (errors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
