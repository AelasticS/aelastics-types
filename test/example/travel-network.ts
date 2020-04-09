import * as t from '../../src/aelastics-types'

export const TravelSchema = t.schema('TravelSchema')

export const Place = t.object(
  {
    name: t.string,
    neighbor: t.arrayOf(t.link(TravelSchema, 'Place'))
  },
  'Place',
  TravelSchema
)