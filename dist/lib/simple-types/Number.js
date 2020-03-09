/*
 * Copyright (c) AelasticS 2019.
 */
import { SimpleTypeC } from './SimpleType'

export class NumberTypeC extends SimpleTypeC {
  constructor(name) {
    super(name)
    this._tag = 'Number'
  }

  /**
   * Test a number to be in a specified range.
   *
   * @param start Start of the range.
   * @param end End of the range.
   */
  inRange(start, end) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be in range [${start}..${end}], got ${value}`,
      predicate: value => value >= Math.min(start) && value <= Math.max(end)
    })
  }

  /**
   * Test a number to be greater than the provided value.
   *
   * @param x Minimum value.
   */
  greaterThan(x) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be greater than ${x}, got ${value}`,
      predicate: value => value > x
    })
  }

  /**
   * Test a number to be greater than or equal to the provided value.
   *
   * @param x Minimum value.
   */
  greaterThanOrEqual(x) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be greater than or equal to ${x}, got ${value}`,
      predicate: value => value >= x
    })
  }

  /**
   * Test a number to be less than the provided value.
   *
   * @param x Maximum value.
   */
  lessThan(x) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be less than ${x}, got ${value}`,
      predicate: value => value < x
    })
  }

  /**
   * Test a number to be less than or equal to the provided value.
   *
   * @param x Minimum value.
   */
  lessThanOrEqual(x) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be less than or equal to ${x}, got ${value}`,
      predicate: value => value <= x
    })
  }

  /**
   * Test a number to be equal to a specified number.
   *
   * @param expected Expected value to match.
   */
  equal(expected) {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be equal to ${expected}, got ${value}`,
      predicate: value => value === expected
    })
  }

  /**
   * Test a number to be an integer.
   */
  get integer() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be an integer, got ${value}`,
      predicate: value => Number.isInteger(value) // is.integer(value)
    })
  }

  /**
   * Test a number to be finite.
   */
  get finite() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be finite, got ${value}`,
      predicate: value => Number.isFinite(value)
    })
  }

  /**
   * Test a number to be infinite.
   */
  get infinite() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be infinite, got ${value}`,
      predicate: value => !Number.isFinite(value)
    })
  }

  /**
   * Test a number to be positive.
   */
  get positive() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be positive, got ${value}`,
      predicate: value => value > 0
    })
  }

  /**
   * Test a number to be negative.
   */
  get negative() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be negative, got ${value}`,
      predicate: value => value < 0
    })
  }

  /**
   * Test a number to be an integer or infinite.
   */
  get integerOrInfinite() {
    return this.addValidator({
      message: (value, label) => `Expected ${label} to be an integer or infinite, got ${value}`,
      predicate: value => Number.isInteger(value) || !Number.isFinite(value) // .infinite(value)
    })
  }

  /**
   * Test a number to be in a isValid range for a 8-bit unsigned integer.
   */
  get uint8() {
    return this.integer.inRange(0, 255)
  }

  /**
   * Test a number to be in a isValid range for a 16-bit unsigned integer.
   */
  get uint16() {
    return this.integer.inRange(0, 65535)
  }

  /**
   * Test a number to be in a isValid range for a 32-bit unsigned integer.
   */
  get uint32() {
    return this.integer.inRange(0, 4294967295)
  }

  /**
   * Test a number to be in a isValid range for a 8-bit signed integer.
   */
  get int8() {
    return this.integer.inRange(-128, 127)
  }

  /**
   * Test a number to be in a isValid range for a 16-bit signed integer.
   */
  get int16() {
    return this.integer.inRange(-32768, 32767)
  }

  /**
   * Test a number to be in a isValid range for a 32-bit signed integer.
   */
  get int32() {
    return this.integer.inRange(-2147483648, 2147483647)
  }
}

/**
 *  Number type
 */
// tslint:disable-next-line:variable-name
export const number = new NumberTypeC('number')
number.addValidator({
  message: (value, label) => `Value ${label}: "${value}" is not of type "${label}`,
  predicate: (value) => (typeof value === 'number')
})
//# sourceMappingURL=Number.js.map
