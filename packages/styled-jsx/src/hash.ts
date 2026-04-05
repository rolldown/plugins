import { hash } from 'node:crypto'

export function computeHash(css: string): string {
  return hash('md5', css, 'hex').slice(0, 16)
}
