import { transformWithBabel, type TransformResult } from './transform.ts'

export interface WorkerError {
  message: string
  stack: string | undefined
  code: string | undefined
  reasonCode: string | undefined
  pos: number | undefined
  loc: { line: number; column: number } | undefined
}

export type WorkerResponse = { result: TransformResult | undefined } | { error: WorkerError }

export async function transform(
  args: Parameters<typeof transformWithBabel>,
): Promise<WorkerResponse> {
  try {
    return { result: await transformWithBabel(...args) }
  } catch (err: any) {
    // The structured clone of an error drops fields such as `loc`, so send a plain object.
    return {
      error: {
        message: err.message,
        stack: err.stack,
        code: err.code,
        reasonCode: err.reasonCode,
        pos: err.pos,
        loc: err.loc && { line: err.loc.line, column: err.loc.column },
      },
    }
  }
}
