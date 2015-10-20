import Freezer from 'freezer-js';

export default class Store {
  static GLOBAL_DATA;

  constructor(initialData) {
    if (initialData)
      this.constructor.GLOBAL_DATA = new Freezer(initialData);
    this.__setKeyPath([]);
    this.defaults = {}
  }

  __globalData() {
    return this.constructor.GLOBAL_DATA.get();
  }

  __setKeyPath(newKeyPath) {
    this.keyPath = newKeyPath;
    this.data = this.__dataFromKeyPath(this.keyPath);
  }

  __dataFromKeyPath(aKeyPath) {
    var data = this.__globalData();
    if (aKeyPath.length === 0)
      return data;

    aKeyPath.forEach((keyName) => {
      if (data.hasOwnProperty(keyName))
        data = data[keyName];
      else
        return undefined;
    })
    return data;
  }

  setDefaults(defaultValues) {
    this.defaults = defaultValues;
  }

  get(propName) {
    if (this.data && this.data.hasOwnProperty(propName))
      return this.data[propName];
    else if (this.defaults.hasOwnProperty(propName))
      return this.defaults[propName];
    else
      return undefined;
  }

  branch(name) {
    var newStore = new Store()
    var newKeyPath = this.keyPath.slice(0);
    newKeyPath.push(name);
    newStore.__setKeyPath(newKeyPath);
    return newStore;
  }

  set(propObject) {
    // First create empty objects in this entire branch
    if (typeof this.data === undefined) {
      var pointer = this.__globalData();
      this.keyPath.forEach((key) => {
        if (pointer.hasOwnProperty(key))
          pointer = pointer[key];
        else
          pointer.set(key, {});
      })
      this.data = this.__dataFromKeyPath(this.keyPath);
    }

    Object.keys(propObject).forEach((key) => {
      this.data.set(key, propObject[key]);
    })
  }

  on(eventName, func) {
    this.constructor.GLOBAL_DATA.on(eventName, func);
  }
}