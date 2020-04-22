import { VisitedNodes } from './VisitedNodes'
import { Any } from './Type'
import { IObjectLiteral } from './CommonDefinitions'

export type PositionType = 'BeforeChildren' | 'AfterChild' | 'AfterAllChildren' | 'Leaf'

export type RoleType =
  | 'asProperty'
  | 'asArrayElement'
  | 'asMapKey'
  | 'asMapValue'
  | 'asElementOfUnion'
  | 'asElementOfTaggedUnion'
  | 'asIntersectionElement'
  | 'asIdentifierPart'
  | 'asFuncArgument'
  | 'asFuncValue'
  | 'asRoot'

// interface {} add parent child info
export interface NodeInfo<A, R> {
  type: Any
  instance: any
  role: RoleType
  result: R
  accumulator: A
  optional: boolean
  extra: Partial<{
    propName: string
    index: number
    //    unionType:Any
    //    unionInstance:any
    //    dicriminantValue:any
  }>
  parent: NodeInfo<A, R> | undefined
  currentChild: NodeInfo<A, R> | undefined
}

export function createNodeInfo<A, R>(
  type: Any,
  instance: any,
  role: RoleType,
  result: R,
  accumulator: A,
  optional: boolean,
  extra: IObjectLiteral,
  parent?: NodeInfo<A, R>,
  child?: NodeInfo<A, R>
): NodeInfo<A, R> {
  return {
    type: type,
    instance: instance,
    role: role,
    result: result,
    accumulator: accumulator,
    optional: optional,
    extra: extra,
    parent: parent,
    currentChild: child
  }
}

export type ExtraInfo = Partial<{
  propName: string
  index: number
  parentType: Any
  parentInstance: any
  parentResult: any
  childExtra: {}
  optional: boolean
}>

export type WhatToDo = 'continue' | 'terminate' | 'skipChildren' | 'skipChild'

export type TraversalFunc_NEW<A, R> = (
  type: Any,
  value: any,
  accumulator: A,
  parentResult: R,
  position: PositionType,
  role: RoleType,
  context: TraversalContext<R>,
  parentNodeInfo?: NodeInfo<A, R>
) => [R, WhatToDo]

export type TraversalFunc_OLD<R> = (
  type: Any,
  value: any,
  accumulator: R,
  position: PositionType,
  role: RoleType,
  extra: ExtraInfo,
  context: TraversalContext<R>
) => R

export class TraversalContext<R> {
  initValue: R
  public readonly entries: TraversalContextEntry[] = []
  skipSimpleTypes: boolean = true
  traversed: VisitedNodes<Any, any, any> = new VisitedNodes<Any, any, any>()

  constructor(initValue: R, skipSimpleTypes: boolean) {
    this.initValue = initValue
    this.skipSimpleTypes = skipSimpleTypes
    //    this.pushEntry('BeforeChildren', 'asRoot', {})
  }

  pushEntry(/*p: PositionType,*/ r: RoleType, e: ExtraInfo) {
    this.entries.push(new TraversalContextEntry(/*p, */ r, e, this.parentEntry))
  }

  popEntry() {
    return this.entries.pop()
  }

  get parentEntry(): TraversalContextEntry | undefined {
    if (this.entries.length <= 0) {
      // throw new Error(`TraversalContext.pop() error: array of entries empty!`)
      return undefined
    }
    return this.entries[this.entries.length - 1]
  }
}

class TraversalContextEntry {
  parent?: TraversalContextEntry
  //  position: PositionType
  role: RoleType
  extra: ExtraInfo

  constructor(/*p: PositionType,*/ r: RoleType, e: ExtraInfo, parent?: TraversalContextEntry) {
    //    this.position = p
    this.role = r
    this.extra = e
    this.parent = parent
  }
}
