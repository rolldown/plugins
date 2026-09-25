import workerpool from 'workerpool'
import { transformWithBabel } from './transform.ts'

async function transform(...args: Parameters<typeof transformWithBabel>) {
  try {
    return await transformWithBabel(...args)
  } catch (err: any) {
    // workerpool drops nested fields such as `loc.line` unless the error has a `toJSON`.
    err.toJSON = () => ({
      message: err.message,
      stack: err.stack,
      code: err.code,
      reasonCode: err.reasonCode,
      pos: err.pos,
      loc: err.loc && { line: err.loc.line, column: err.loc.column },
    })
    throw err
  }
}

workerpool.worker({ transform })
