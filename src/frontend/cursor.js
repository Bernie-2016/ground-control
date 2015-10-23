import Freezer from 'freezer-js';

export class Cursor {
  constructor(store, keyPath) {
    this.rootStore = store;
    this.setKeyPath(keyPath);
  }

  setKeyPath(newKeyPath) {
    this.keyPath = newKeyPath;
    this.data = this.dataFromKeyPath(this.keyPath);
  }

  dataFromKeyPath(aKeyPath) {
    var data = this.rootStore.get();
    if (aKeyPath.length === 0)
      return data;

    aKeyPath.forEach((keyName) => {
      if (data && data.hasOwnProperty(keyName))
        data = data[keyName];
      else {
        data = undefined;
        return;
      }
    })
    return data;
  }

  get(propName) {
    if (typeof propName === 'undefined')
      return this.data;

    if (typeof this.data !== 'undefined')
      return this.data[propName];
    else
      return undefined;
  }

  set(val) {
    // First create empty objects in this entire branch if we have refined beyond the existing tree
    if (typeof this.data === 'undefined') {
      var pointer = this.rootStore.get();
      this.keyPath.forEach((key) => {
        if (pointer.hasOwnProperty(key))
          pointer = pointer[key];
        else {
          pointer = pointer.set(key, {});
        }
      });
      this.data = this.dataFromKeyPath(this.keyPath);
    }

    if (typeof val === 'object') {
      Object.keys(val).forEach((key) => {
        this.data.set(key, val[key]);
      })
    }
    else
      this.data.set(val);
  }

  refine(names) {
    if (typeof names === 'string')
      names = [names];
    return new Cursor(this.rootStore, this.keyPath.concat(names));
  }
}

export class Store {
  constructor(initialData) {
    this.data = new Freezer(initialData);
  }

  refine(names) {
    return new Cursor(this.data, []).refine(names);
  }

  on(eventName, func) {
    this.data.on(eventName, func);
  }
}