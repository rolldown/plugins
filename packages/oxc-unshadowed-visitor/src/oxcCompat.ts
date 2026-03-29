import type * as rolldownUtils from 'rolldown/utils'
import type * as OxcParser from 'oxc-parser'

// https://github.com/type-challenges/type-challenges/issues/29285
type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false

type RolldownVisitorObject = rolldownUtils.VisitorObject
export type VisitorObject =
  IsAny<RolldownVisitorObject> extends false ? rolldownUtils.VisitorObject : OxcParser.VisitorObject

export type Program =
  IsAny<rolldownUtils.ESTree.Program> extends false
    ? rolldownUtils.ESTree.Program
    : OxcParser.Program
export type Node =
  IsAny<rolldownUtils.ESTree.Node> extends false ? rolldownUtils.ESTree.Node : OxcParser.Node
