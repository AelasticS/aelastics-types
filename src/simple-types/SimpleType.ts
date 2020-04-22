/*
 * Copyright (c) AelasticS 2019.
 */

import { Any, ToDtoContext, FromDtoContext, TypeC } from '../common/Type'
import { Path, Result, success } from 'aelastics-result'
import {
  ExtraInfo,
  NodeInfo,
  PositionType,
  RoleType,
  TraversalContext,
  TraversalFunc_NEW,
  TraversalFunc_OLD,
  WhatToDo
} from '../common/TraversalContext'

export abstract class SimpleTypeC<V, G = V, T = V> extends TypeC<V, G, T> {
  //    public readonly _tagSimple: 'Simple' = 'Simple';

  constructor(name: string) {
    super(name)
  }

  fromDTOCyclic(value: T | G, path: Path, context: FromDtoContext): V | undefined {
    return value as any
  }

  /** @internal */
  public toDTOCyclic(input: V, path: Path, context: ToDtoContext): T | G {
    return (input as any) as T | G
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return success(true)
  }

  traverseCyclic<R>(
    instance: V,
    f: TraversalFunc_OLD<R>,
    currentResult: R,
    role: RoleType,
    extra: ExtraInfo,
    context: TraversalContext<R>
  ): R {
    return f(this, instance, currentResult, 'Leaf', role, extra, context)
  }

  traverseCyclic_NEW<A, R>(
    instance: any,
    f: TraversalFunc_NEW<A, R>,
    accumulator: A,
    parentResult: R,
    role: RoleType,
    optional: boolean,
    extra: ExtraInfo,
    context: TraversalContext<R>,
    parentNode?: NodeInfo<any, R>
  ): [R, WhatToDo] {
    return f(this as Any, instance, accumulator, parentResult, 'Leaf', role, context, parentNode)
  }
}
