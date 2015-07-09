import angular from 'angular';
import getUniqueName from './getUniqueName';

let dependencyMap = new Map();
let defaultModule = angular.module(getUniqueName(), []);

export default class DependencyManager {
  static findImplementation(clazz) {
    return dependencyMap.get(clazz);
  }

  static getDefaultModuleName() {
    return defaultModule.name;
  }

  static bind(iface) {
    return {
      to: impl => dependencyMap.set(iface, impl),
      toValue: val => defaultModule.config(['$provide', x => x.value(iface.$name, val)])
    };
  }
}
