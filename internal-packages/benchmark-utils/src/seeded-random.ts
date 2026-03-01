/**
 * Seeded random number generator for deterministic output.
 * All benchmark generators use seed=42.
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed / 0x7fffffff
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max)
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(arr.length)]
  }

  shuffle<T>(arr: T[]): T[] {
    const result = [...arr]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1)
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, n)
  }
}
