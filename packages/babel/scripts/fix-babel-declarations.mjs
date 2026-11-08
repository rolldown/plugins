import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distPath = fileURLToPath(new URL('../dist/', import.meta.url))
const files = (await readdir(distPath)).filter((file) => /\.d\.(?:m)?ts$/.test(file))
const declarations = new Set([
  'InputOptions8',
  'PresetItem8',
  'FileResult8',
  'TransformOptions',
  'BabelFileResult',
])
const found = new Set()

for (const file of files) {
  const path = join(distPath, file)
  const lines = (await readFile(path, 'utf8')).split('\n')
  let changed = false

  for (let i = 0; i < lines.length; i++) {
    const match = /^type ([A-Za-z_$][\w$]*)\b/.exec(lines[i])
    if (!match || !declarations.has(match[1])) continue
    found.add(match[1])
    if (lines[i - 1]?.startsWith('// @ts-ignore')) continue
    lines.splice(i, 0, '// @ts-ignore -- only available in one supported Babel major version')
    i++
    changed = true
  }

  if (changed) await writeFile(path, lines.join('\n'))
}

for (const declaration of declarations) {
  if (!found.has(declaration)) {
    throw new Error(`Could not find ${declaration} in the generated Babel declarations`)
  }
}
