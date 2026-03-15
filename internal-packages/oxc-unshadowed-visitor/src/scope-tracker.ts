interface ScopeFrame {
  kind: 'function' | 'block'
  /** per tracked name, does THIS scope shadow it? */
  shadows: boolean[]
  /** index into records array when scope was pushed */
  recordsStartIdx: number
}

export interface Invalidatable {
  nameIdx: number
  invalidated: boolean
}

export class ScopeTracker {
  /** per tracked name, 0 = not shadowed */
  private shadowDepth: number[]
  private nameCount: number
  private scopeStack: ScopeFrame[]

  constructor(nameCount: number) {
    this.nameCount = nameCount
    this.shadowDepth = Array.from<number>({ length: nameCount }).fill(0)
    this.scopeStack = []
  }

  pushScope(kind: 'function' | 'block', recordsLength: number): void {
    this.scopeStack.push({
      kind,
      shadows: Array.from<boolean>({ length: this.nameCount }).fill(false),
      recordsStartIdx: recordsLength,
    })
  }

  popScope(): void {
    const frame = this.scopeStack.pop()
    if (!frame) return

    // For each name shadowed by this scope, decrement the depth counter
    for (let i = 0; i < this.nameCount; i++) {
      if (frame.shadows[i]) {
        this.shadowDepth[i]--
      }
    }
  }

  /**
   * Declare a block-scoped binding (let, const, class, catch param).
   * Declares at the top of the scope stack.
   * If the stack is empty (module level), returns without shadowing.
   */
  declareBlock(nameIdx: number, records: Invalidatable[]): void {
    if (this.scopeStack.length === 0) return // module level — not shadowing
    const frame = this.scopeStack[this.scopeStack.length - 1]
    this._declare(frame, nameIdx, records)
  }

  /**
   * Declare a var-scoped binding.
   * Walks up the scope stack to find the nearest 'function' scope.
   * If none found (module level), returns without shadowing.
   */
  declareVar(nameIdx: number, records: Invalidatable[]): void {
    // Walk up to find nearest function scope
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i].kind === 'function') {
        this._declare(this.scopeStack[i], nameIdx, records)
        return
      }
    }
    // No function scope found — module level, no shadowing
  }

  isShadowed(nameIdx: number): boolean {
    return this.shadowDepth[nameIdx] > 0
  }

  private _declare(frame: ScopeFrame, nameIdx: number, records: Invalidatable[]): void {
    if (frame.shadows[nameIdx]) return // already shadowed in this scope

    frame.shadows[nameIdx] = true
    this.shadowDepth[nameIdx]++

    // Retroactively invalidate records from this scope's start
    this._retroactiveInvalidate(frame.recordsStartIdx, nameIdx, records)
  }

  private _retroactiveInvalidate(fromIdx: number, nameIdx: number, records: Invalidatable[]): void {
    for (let i = fromIdx; i < records.length; i++) {
      if (records[i].nameIdx === nameIdx) {
        records[i].invalidated = true
      }
    }
  }
}
