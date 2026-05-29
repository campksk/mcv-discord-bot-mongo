export default class MutableWrapper<T> {
  _value: T
  constructor(value: T) {
    this._value = value
  }
  get value() {
    return this._value
  }
  set value(newValue: T) {
    this._value = newValue
  }
}
