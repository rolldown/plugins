export interface VisitorContext<T> {
  record(opts: { name: string; node: object; data: T }): void
}
