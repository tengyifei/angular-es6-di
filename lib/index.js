import angular from 'angular';
import getUniqueName from './getUniqueName';
import DI from './DependencyManager';
import Provider from './AutoLookupProvider';

let stringOfClass = x => typeof x === 'function' ? x.$name : x;
let crawlPrototypes = clazz => {
  let classes = [];
  while (clazz.$name) {
    classes.push(clazz);
    clazz = Object.getPrototypeOf(clazz);
  }
  return classes;
};

export function Service(input = []) {
  let func = dependencies => clazz => {
    clazz.$name = getUniqueName() + clazz.name;   // name leading to a proxy provider
    clazz.$internal = getUniqueName();   // name that actually leads to the instance

    clazz.$inject = dependencies.map(stringOfClass);
    clazz.$overrides = crawlPrototypes(clazz);
    clazz.$applyOverride = module => {
      clazz.$overrides.forEach(iface => {
        DI.bind(iface).to(clazz);
        // Register every interface/implementation in angular
        // Will figure out exact implementation later
        module.provider(iface.$name, new Provider(module, iface));
      });
      // Register real instance with internal name
      module.service(clazz.$internal, clazz);
    };
    clazz.$registerOn = clazz.$applyOverride;
    return clazz;
  };
  // Unwrapping
  if (input.constructor !== Array) {
    return func([])(input);
  } else {
    return func(input);
  }
}

export let Default = defVal => clazz => { clazz.$default = defVal; return clazz; };

export function Value(clazz) {
  clazz.$name = getUniqueName() + clazz.name;
  if (clazz.$default) DI.bind(clazz).toValue(clazz.$default);
}

export function Controller(input = []) {
  let func = dependencies => clazz => {
    clazz.$name = getUniqueName() + clazz.name;
    clazz.$inject = dependencies.map(stringOfClass);
    clazz.$registerOn = module =>
      module.config(['$controllerProvider', x => x.register(clazz.$name, clazz)]);
    return clazz;
  };
  // Unwrapping
  if (input.constructor !== Array) {
    return func([])(input);
  } else {
    return func(input);
  }
}

// Extend Angular modules with `.use`
let origModuleCall = angular.module;
angular.module = function () {
  let module = origModuleCall.apply(angular, arguments);
  module.use = (...components) =>
    components.forEach(component => component.$registerOn(module));
  // Extend Angular `.value` calls to process annotated values
  let origValueCall = module.value;
  module.value = function () {
    // Calling with annotated value class?
    if (arguments[0].constructor !== String) arguments[0] = arguments[0].$name;
    return origValueCall.apply(module, arguments);
  };
  return module;
};
