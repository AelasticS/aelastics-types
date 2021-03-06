import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'

describe('fromDTOtree tests for Map', () => {
  it('testing fromDTOtree with some values that comply with restrictions', () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Ivan',
          age: 21
        }
      ],
      [
        2,
        {
          name: 'Stefan',
          age: 33
        }
      ]
    ]
    let map = examples.MapofPeople.fromDTOtree(DTOObject as any)
    expect(isSuccess(map)).toBe(true)
  })
  it("testing fromDTOtree with some values that don't comply with restrictions (name)", () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Ivan34',
          age: 21
        }
      ],
      [
        2,
        {
          name: 'Stefan',
          age: 33
        }
      ]
    ]
    let map = examples.MapofPeople.fromDTOtree(DTOObject as any)
    if (isFailure(map)) {
      let s = examples.errorMessages(map)
      expect(s).toEqual('Expected [1]:undefined/name:Ivan34 to be alphabetical, got `Ivan34`\n')
    }
  })

  it('testing fromDTOtree with some values that comply with restrictions for type examples.MapOfCountries', () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Serbia',
          cities: [
            [1, { name: 'Belgrade', languages: [[1, 'Serbian']] }],
            [
              2,
              {
                name: 'Subotica',
                languages: [
                  [1, 'Serbian'],
                  [2, 'Hungarian']
                ]
              }
            ]
          ]
        }
      ],
      [
        2,
        {
          name: 'Germany',
          cities: [
            [
              1,
              {
                name: 'Berlin',
                languages: [
                  [1, 'German'],
                  [2, 'English']
                ]
              }
            ]
          ]
        }
      ]
    ]
    let map = examples.MapOfCountries.fromDTOtree(DTOObject as any)
    expect(isSuccess(map)).toBe(true)
  })

  it("testing fromDTOtree with some values that don't comply with restrictions for type examples.MapOfCountries ", () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Serbia',
          cities: [
            [1, { name: 'Belgrade.', languages: [[1, 'Serbian1']] }],
            [
              2,
              {
                name: 'Subotica',
                languages: [
                  [1, 'Serbian'],
                  [2, 'Hungarian']
                ]
              }
            ]
          ]
        }
      ],
      [
        2,
        {
          name: 'Germany',
          cities: [
            [
              1,
              {
                name: 'Berlin',
                languages: [
                  [1, 'German'],
                  [2, 'English']
                ]
              }
            ]
          ]
        }
      ]
    ]
    let map = examples.MapOfCountries.fromDTOtree(DTOObject as any)
    if (isFailure(map)) {
      let s = examples.errorMessages(map)
      expect(s).toEqual(
        'Expected [1]:undefined/cities:[object Map]/[1]:undefined/name:Belgrade. to be alphabetical, got `Belgrade.`\n' +
          'Expected [1]:undefined/cities:[object Map]/[1]:undefined/languages:[object Map]/[1]:undefined to be alphabetical, got `Serbian1`\n'
      )
    }
  })
})
