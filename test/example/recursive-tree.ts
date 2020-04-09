import * as t from '../../src/aelastics-types'
import { DirectorType } from './types-example'

export const FileSystemSchema = t.schema('FileSystemSchema')
export const Item = t.object(
  {
    name: t.string,
    creationDate: t.date,
    parentDirectory: t.optional(t.link(FileSystemSchema, 'Directory'))
  },
  'Item',
  FileSystemSchema
)

export const File = t.subtype(
  Item,
  {
    fileType: t.string
  },
  'File',
  FileSystemSchema
)

export const directory = t.subtype(
  Item,
  {
    items: t.arrayOf(Item)
  },
  'Directory',
  FileSystemSchema
)

export const myFileSystem: t.TypeOf<typeof File> = {
  name: 'My file',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  fileType: 'txt'
}

export const dir1: t.TypeOf<typeof directory> = {
  name: 'My dir1',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [myFileSystem]
}
export const dir2: t.TypeOf<typeof directory> = {
  name: 'My dir2',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [dir1]
}

dir1.parentDirectory = dir2
myFileSystem.parentDirectory = dir1