import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'
import { TypeOf } from '../../../src/aelastics-types'

describe('Validate Cyclic array structures', () => {
  it('Testing if two instances in array witch is the same object is valid', () => {
    const type = examples.arrayOfRootLevelObjects
    let second = {
      name: 'Something'
    }
    let root = {
      a: second,
      b: second
    }

    let array = [root, root]

    expect(isSuccess(type.validate(array))).toBe(true)
  })

  it('Testing if two instances in obj are same arey is valid', () => {
    const type = examples.objectWithArrays
    let second = {
      name: 'Something'
    }
    let root = {
      a: second,
      b: second
    }

    let array = [root, root]

    let obj = {
      a: array,
      b: array
    }

    expect(isSuccess(type.validate(obj))).toBe(true)
  })

  it("Testing if cyclic arrey is valid'", () => {
    const type = examples.firstLevelArray
    examples.arraySchema.validate()
    let o = {
      a: true,
      b: 11,
      c: [{}]
    }
    let arr = [o]
    arr[0].c = [arr]
    let res = type.validate(arr)
    expect(isSuccess(res)).toBe(true)
  })
})
