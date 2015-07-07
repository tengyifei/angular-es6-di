import angular from 'angular';

let depChain = new Map();

/**
 * Gets a unique name for Angular services and controllers.
 */
function getUniqueName () {
  let text = [];
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-*.:=|!@#%&~';

  for (let i = 0; i < 16; i++) {
    text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  return text.join('');
}

function findImplementation (clazz) {
  return depChain.get(clazz);
}

class Provider {
  constructor(module, clazz) {
    this.module = module;
    this.Class = clazz;
    this.instance = null;
  }

  $get() {
    //console.log('Get ' + this.Class.$name + ' in ' + this.module.name);
    let $injector = angular.injector([this.module.name]);
    let Impl = findImplementation(this.Class);
    if (Impl.$name === this.Class.$name) {
      //console.log('Instantiating ' + Impl.$name);
      if (this.instance) return this.instance;
      this.instance = $injector.get(Impl.$internal);
      return this.instance;
    } else {
      //console.log('Delegating to ' + Impl.$name);
      return $injector.get(Impl.$name);
    }
  }
}

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
    clazz.$name = getUniqueName();   // name leading to a proxy provider
    clazz.$internal = getUniqueName();   // name that actually leads to the instance

    clazz.$inject = dependencies.map(stringOfClass);
    clazz.$overrides = crawlPrototypes(clazz);
    clazz.$applyOverride = module => {
      clazz.$overrides.forEach(iface => {
        depChain.set(iface, clazz);
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

export function Controller(input = []) {
  let func = dependencies => clazz => {
    clazz.$name = getUniqueName();
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

let origModuleCall = angular.module;
angular.module = function () {
  let module = origModuleCall.apply(angular, arguments);
  module.use = (...components) =>
    components.forEach(component => component.$registerOn(module));
  return module;
};
