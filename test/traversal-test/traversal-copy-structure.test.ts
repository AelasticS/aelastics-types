import { Place, Belgrade, IPlace } from '../example/travel-network'
import { types } from '../../src/aelastics-types'
import isSimpleType = types.isSimpleType
import { TraversalFunc, WhatToDo } from '../../src/common/TraversalContext'

const copyObjectPropertyStructure: TraversalFunc = (
  node,
  position,
  ct
  /*  type,
  value,
  accumulator,
  prevousNodeResult,
  position,
  role,
  extra,
  context,
  parentNodeInfo*/
): [{ [key: string]: any }, WhatToDo] => {
  switch (node.type.category) {
    case 'Object':
      if (position === 'BeforeChildren') {
        return [{}, 'continue']
      }
      if (position === 'AfterChild') {
        node.currentResult![node.currentChild!.extra.propName!] = node.currentChild?.currentResult
      }
      /*      if (position === 'AfterAllChildren' && node.role === 'asProperty') {
              node.inputArg[node.extra.propName!] = node.currentResult
            }
            if (position === 'AfterAllChildren' && node.role === 'asArrayElement') {
              node.inputArg[node.extra.index!] = node.currentResult
            }*/
      /*      if (position === 'AfterAllChildren' && node.role === 'asRoot') {
      }*/
      break
    case 'Array':
      if (position === 'BeforeChildren') {
        node.currentResult = []
      }
      if (position === 'AfterChild') {
        node.currentResult![node.currentChild!.extra.index!] = node.currentChild?.currentResult
      }

    /*      if (position === 'AfterAllChildren' && node.role === 'asProperty') {
            node.inputArg[node.extra.propName!] = node.currentResult
          }
          if (position === 'AfterAllChildren' && node.role === 'asArrayElement') {
            node.inputArg[node.extra.index!] = node.currentResult
          }
          break */
  }
  if (isSimpleType(node.type) && node.role === 'asProperty' && node.extra?.propName === 'name') {
    node.currentResult = `${node.instance}-copy` as any
  }
  /*  if (isSimpleType(node.type) && node.role === 'asProperty' && node.extra?.propName === 'name') {
      node.inputArg[node.extra.propName!] = `${node.instance}-copy`
    }*/
  return [node.currentResult!, 'continue']
}

describe('Test cases for copying structure traversals', () => {
  it('should an object copy - only simple and object properties', () => {
    let copy: IPlace = Place.traverseDFS(
      Belgrade,
      copyObjectPropertyStructure,
      undefined,
      Place.defaultValue()
    ) as IPlace
    expect(copy.name).toEqual('Belgrade-copy')
    expect(copy.neighbor.length).toEqual(3)
  })
})
