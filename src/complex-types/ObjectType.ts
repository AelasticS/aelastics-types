/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  failures,
  failureValidation,
  isFailure,
  success,
  validationError,
  Path,
  Result,
  ValidationError
} from 'aelastics-result'
import { ComplexTypeC, InstanceReference } from './ComplexType'
import {
  Any,
  ConversionContext,
  ConversionOptions,
  DtoTreeTypeOf,
  DtoTypeOf,
  TypeC,
  TypeOf
} from '../common/Type'
import { OptionalTypeC } from '../common/Optional'
import { TypeSchema } from '../common/TypeSchema'
import { ArrayTypeC } from './Array'
import { MapTypeC } from './Map'

export interface Props {
  [key: string]: Any // TypeC<any>
}

export type ObjectType<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }
export type DtoProps<P extends Props> = { [K in keyof P]: DtoTypeOf<P[K]> }

export type DtoObjectType<P extends Props> = {
  ref: InstanceReference
  object: DtoProps<P>
}

export const isObject = (u: any) => u !== null && typeof u === 'object'

export const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

/**
 *
 */
export class ObjectTypeC<P extends Props, I extends readonly string[]> extends ComplexTypeC<
  P,
  ObjectType<P>,
  DtoObjectType<P>,
  DtoProps<P>
> {
  public ID!: { [k in I[number]]: TypeOf<P[k]> }
  public ID_DTO!: { [k in I[number]]: DtoTypeOf<P[k]> }
  public ID_DTO_TREE!: { [k in I[number]]: DtoTreeTypeOf<P[k]> }
  public readonly _tag: 'Object' = 'Object'
  public readonly keys = Object.keys(this.baseType)
  public readonly types = this.keys.map(key => this.baseType[key] as TypeC<any>)
  public readonly len = this.keys.length
  public readonly identifier: I
  public inverseCollection: Map<string, { prop: string; type: ObjectTypeC<any, []> }> = new Map<
    string,
    { prop: string; type: ObjectTypeC<any, []> }
  >()

  protected getPropsInfo(): [string[], TypeC<any, any, any>[], number] {
    return [this.keys, this.types, this.len]
  }

  constructor(name: string, props: P, identifier: I) {
    super(name, props)
    this.identifier = identifier
    this.identifier.forEach(i => {
      if (!this.keys.includes(i)) {
        throw new Error(`Invalid identifier:${i} is not a property of object type ${name}`)
      }
    })
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, TypeC<any>> {
    let mp = new Map<string, TypeC<any>>()
    this.keys.forEach(key => mp.set(key, this.baseType[key] as TypeC<any>))
    return mp
  }

  public defaultValue(): any {
    const obj = {}
    for (let i = 0; i < this.len; i++) {
      // @ts-ignore
      obj[this.keys[i]] =
        this.types[i] instanceof ObjectTypeC ? undefined : this.types[i].defaultValue()
      // obj[this.keys[i]] = this.types[i].defaultValue();
    }
    return obj
  }

  public validate(input: ObjectType<P>, path: Path = []): Result<boolean> {
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    const errors: ValidationError[] = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      if (!Object.prototype.hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }
      const ak = input[k]
      const validation = t.validate(ak, appendPath(path, k, t.name, ak))
      if (isFailure(validation)) {
        errors.push(...(validation.errors as ValidationError[]))
      }
    }
    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...(res.errors as ValidationError[]))
    }
    return errors.length ? failures(errors) : success(true)
  }

  protected isObjRef(input: any): input is DtoObjectType<P> {
    if (input.ref && input.object) {
      return true
    }
    return false
  }

  makeDTOInstance(
    input: ObjectType<P>,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: ValidationError[],
    context: ConversionContext
  ): DtoProps<P> | DtoObjectType<P> {
    try {
      let output: DtoProps<P> | DtoObjectType<P>
      let outObject: DtoProps<P> = {} as DtoProps<P>
      let [keys, types, len] = this.getPropsInfo()
      for (let i = 0; i < len; i++) {
        const t = types[i]
        const k = keys[i]
        const ak = input[k]
        const conversion = t.toDTOCyclic(
          ak,
          appendPath(path, k, t.name, ak),
          visitedNodes,
          errors,
          context
        )
        ObjectTypeC.addProperty(outObject, k, conversion)
      }

      if (context.isTreeDTO) {
        output = outObject
      } else {
        output = {
          ref: this.makeReference(input, context),
          object: outObject
        }
      }
      return output
    } catch (e) {
      errors.push(
        validationError(`Caught exception '${(e as Error).message}'`, path, this.name, input)
      )
      return {} as DtoProps<P>
    }
  }

  makeInstanceFromDTO(
    input: DtoProps<P> | DtoObjectType<P>,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: ValidationError[],
    context: ConversionContext
  ): ObjectType<P> {
    let output = {} as ObjectType<P>
    let inputObject: DtoProps<P>
    if (!isObject(input.object)) {
      errors.push(validationError('Input is not an object', path, this.name, input))
      return output
    }
    if (this.isObjRef(input) && !context.isTreeDTO) {
      if (input.ref.typeName !== this.name) {
        // determine correct subtype, add context for schema
        errors.push(
          validationError(
            `Types are not matching: input type is '${input.ref.typeName}' and expected type is '${this.name}'. A possible subtype cannot be handled!`,
            path,
            this.name,
            input
          )
        )
        return output // empty
      } else inputObject = input.object
    } else if (!this.isObjRef(input) && !context.isTreeDTO) {
      inputObject = input
    } else {
      errors.push(
        validationError(
          `Input type '${this.name} at path '${path}' is not valid:"${input.toString()}" `,
          path,
          this.name,
          input
        )
      )
      return output // empty
    }
    if (context.includeTypeInfo) {
      ObjectTypeC.addProperty(output, context.typeInfoPropName, this.name)
    }
    let [keys, types, len] = this.getPropsInfo()
    for (let i = 0; i < len; i++) {
      const t = types[i]
      const k = keys[i]
      if (!Object.prototype.hasOwnProperty.call(inputObject, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }
      const ak = inputObject[k]
      const conversion = t.fromDTOCyclic(
        ak,
        appendPath(path, k, t.name, ak),
        visitedNodes,
        errors,
        context
      )
      ObjectTypeC.addProperty(output, k, conversion)
    }
    return output
  }

  /** @internal */
  public static addProperty(obj: Object, prop: string, value: any) {
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    })
  }

  validateLinks(traversed: Map<any, any>): Result<boolean> {
    traversed.set(this, this)

    let errors = []

    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]

      if (traversed.has(t)) {
        continue
      }
      const res = t.validateLinks(traversed)

      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }

    return errors.length ? failures(errors) : success(true)
  }
}

/**
 *
 * @param props
 * @param name
 * @param schema
 */
export const object = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props),
  schema?: TypeSchema
): ObjectTypeC<P, []> => {
  const obj = new ObjectTypeC<P, []>(name, props, [])
  if (schema) {
    schema.addType(obj)
  }
  return obj
}

/**
 *
 * @param props
 * @param keys
 * @param name
 * @param schema
 */
export const entity = <P extends Props, I extends readonly string[]>(
  props: P,
  keys: I,
  name: string = getNameFromProps(props),
  schema?: TypeSchema
): ObjectTypeC<P, I> => {
  const obj = new ObjectTypeC<P, I>(name, props, keys)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}
/**
 *
 * @param firstType
 * @param firstProp
 * @param secondType
 * @param secondProp
 */
export const inverseProps = (
  firstType: ObjectTypeC<any, any>,
  firstProp: string,
  secondType: ObjectTypeC<any, any>,
  secondProp: string
) => {
  // tslint:disable-next-line:no-constant-condition
  if (true) {
    // todo: Sinisa
    // check that props exist
    let fp = firstType.baseType[firstProp] as TypeC<any>
    if (!fp) {
      throw new Error(`Property '${firstProp}' on type '${firstType.name}' does not extist.`)
      return
    }
    let sp = secondType.baseType[secondProp] as TypeC<any>
    if (!sp) {
      throw new Error(`Property '${secondProp}' on type '${secondType.name}' does not extist.`)
      return
    }
    // handle optional types
    if (fp instanceof OptionalTypeC) {
      fp = fp.base
    }
    if (sp instanceof OptionalTypeC) {
      sp = sp.base
    }
    // handle collections
    if (fp instanceof ArrayTypeC || fp instanceof MapTypeC) {
      fp = fp.baseType
    }
    if (sp instanceof ArrayTypeC || sp instanceof MapTypeC) {
      sp = sp.baseType
    }
    // check that props are object types
    if (!(fp instanceof ObjectTypeC)) {
      throw new Error(
        `Property '${firstProp}' on type '${firstType.name}' not object or entity type.`
      )
      return
    }
    if (!(sp instanceof ObjectTypeC)) {
      throw new Error(
        `Property '${secondProp}' on type '${secondType.name}' not object or entity type.`
      )
      return
    }
    // check that props are correct inverse
    if (fp !== secondType) {
      throw new Error(
        `Property '${firstProp}' on type '${firstType.name}' is not referencing '${secondType.name}' type.`
      )
      return
    }
    if (sp !== firstType) {
      throw new Error(
        `Property '${secondProp}' on type '${secondType.name}' is not referencing '${firstType.name}' type.`
      )
      return
    }
    // check that prop already exist as an inverse
    for (let e of firstType.inverseCollection.values()) {
      if (e.prop === secondProp && e.type === secondType) {
        throw new Error(
          `Property '${secondProp}' of type '${secondType.name}' is already inverse in '${firstType.name}' type.`
        )
        return
      }
    }
    for (let e of secondType.inverseCollection.values()) {
      if (e.prop === firstProp && e.type === firstType) {
        throw new Error(
          `Property '${firstProp}' of type '${firstType.name}' is already inverse in '${secondType.name}' type.`
        )
        return
      }
    }
    firstType.inverseCollection.set(firstProp, { prop: secondProp, type: secondType })
    secondType.inverseCollection.set(secondProp, { prop: firstProp, type: firstType })
  }
}
