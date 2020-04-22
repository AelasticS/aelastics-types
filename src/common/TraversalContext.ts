import { VisitedNodes } from './VisitedNodes'
import { Any } from './Type'

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
export interface NodeInfo {
  type: Any
  instance: any
  isOptional: boolean // is this type optional
  role: RoleType
  inputArg: any
  accumulator: any
  currentResult?: any
  extra: Partial<{
    propName: string
    index: number
    //    unionType:Any
    //    unionInstance:any
    //    dicriminantValue:any
  }>
  currentChild?: NodeInfo
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

export type TraversalFunc = (
  node: NodeInfo,
  pos: PositionType,
  ct: TraversalContext
) => [any, WhatToDo]

export class TraversalContext {
  initValue: any
  skipSimpleTypes: boolean = true
  traversed: VisitedNodes<Any, any, any> = new VisitedNodes<Any, any, any>()

  constructor(initValue: any, skipSimpleTypes: boolean) {
    this.initValue = initValue
    this.skipSimpleTypes = skipSimpleTypes
    //    this.pushEntry('BeforeChildren', 'asRoot', {})
  }
}
