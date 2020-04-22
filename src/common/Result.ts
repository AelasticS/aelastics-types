/**
 *  Result of some function, operation or service
 *  can be success or failure
 */
export type Result<T> = Success<T> | Failure

/**
 *  Failure has one or more errors
 */
export interface Failure {
  type: 'failure'
  errors: Errors
}

/**
 * Success has some value as a result
 */
export interface Success<T> {
  type: 'success'
  value: T
}

/**
 * Functions for distinguish between success and failure, defined as baseType guards
 */
export const isFailure = <T>(arg: Result<T>): arg is Failure => arg.type === 'failure'

export const isSuccess = <T>(arg: Result<T>): arg is Success<T> => arg.type === 'success'

/**
 * Functions for creating success or failure
 * @param value or errors
 */
export const success = <T>(value: T): Result<T> => ({ type: 'success', value })
export const failure = <T>(err: Error): Result<T> => ({ type: 'failure', errors: [err] })
export const failures = <T>(errs: Errors): Result<T> => ({ type: 'failure', errors: errs })

/**
 *  Add new error to failure
 * @param v
 * @param err
 */
export const addError = <T>(v: Failure, err: Error): Result<T> => {
  v.errors.push(err)
  return v
}

/**
 *  Root of hierarchy of error classes
 */
export class Error {
  /** custom error message */
  public readonly message: string
  /** custom error code */
  public readonly code?: string

  constructor(message: string, code?: string) {
    this.message = message
    this.code = code
  }
}

export type Errors = Error[]

/**
 *  Validation error - generated during validation operation of data (i.e. whether objects and values are valid)
 */
export class ValidationError extends Error {
  /** the full path of a value (property) within an object where the error originated */
  public readonly path: Path
  /** the required baseType of a property within an object where the error originated */
  public readonly type: string
  /** the offending (sub)value represented by string */
  public readonly value: string

  constructor(message: string, path: Path, type: string, value: any, code?: string) {
    super(message, code)
    this.path = path
    this.type = type
    this.value = JSON.stringify(value)
  }
}

/**
 * Functions for creating validation errors and failure
 */
export const validationError = (
  message: string,
  path: Path,
  type: string,
  value: any = undefined,
  code?: string
) => new ValidationError(message, path, type, value, code)

export const failureValidation = (
  message: string,
  path: Path,
  type: string,
  value: any = undefined,
  code?: string
) => failure(new ValidationError(message, path, type, value, code))

/**
 *  Path consists of segments;
 *  Defines a path from root to a particular property within  hierarchical structure of an object
 */
export interface Path extends ReadonlyArray<PathSegment> {}

export interface PathSegment {
  readonly segment: string
  /** the data (value or object) at this path segment */
  readonly actual?: unknown
}

/**
 *
 * @param path
 * @param segment
 * @param type
 * @param actual
 */
export const appendPath = (path: Path, segment: string, type: any, actual?: unknown): Path =>
  path.concat({
    segment,
    actual
  })

/**
 *  Print path
 * @param path
 */
export const pathToString = (path: Path, seperator: string = '/'): string =>
  path.map((p: PathSegment) => `${p.segment}:${p.actual}`).join(seperator)
