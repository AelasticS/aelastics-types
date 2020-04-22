import { Place, Belgrade } from '../example/travel-network'
import { types } from '../../src/aelastics-types'
import TraversalFunc = types.TraversalFunc
import isSimpleType = types.isSimpleType
import { TraversalFunc_NEW } from '../../src/common/TraversalContext'

const copyObjectPropertyStructure: TraversalFunc_NEW<any, { [key: string]: any }> = (
  type,
  value,
  accumulator,
  parentResult,
  position,
  role,
  context,
  parentNodeInfo
) => {
  switch (type.category) {
    case 'Object':
      if (position === 'BeforeChildren') {
        currentResult = {}
      }
      if (position === 'AfterAllChildren' && role === 'asProperty') {
        extra.parentResult[extra.propName!] = currentResult
        //       currentResult = extra.parentResult
      }
      if (position === 'AfterAllChildren' && role === 'asArrayElement') {
        ;(extra.parentResult as any)[extra.index!] = currentResult
        currentResult = extra.parentResult
      }

      if (position === 'AfterAllChildren' && role === 'asRoot') {
        currentResult = currentResult
      }
      break
    case 'Array':
      if (position === 'BeforeChildren') {
        currentResult = []
      }
      if (position === 'AfterAllChildren' && role === 'asProperty') {
        extra.parentResult[extra.propName!] = currentResult
        //       currentResult = extra.parentResult
      }
      break
  }
  if (isSimpleType(type) && role === 'asProperty' && extra?.propName === 'name') {
    extra.parentResult[extra.propName!] = `${value}-copy`
  }
  return currentResult
}

describe('Test cases for copying structure traversals', () => {
  it('should an object copy - only simple and object properties', () => {
    let copy = Place.traverse(Belgrade, copyObjectPropertyStructure, {})
    expect(copy.name).toEqual('Belgrade-copy')
  })
})
