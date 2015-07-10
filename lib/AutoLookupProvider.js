import DI from './DependencyManager';

/**
 * Provides a service by looking up its implementations.
 */
export default class AutoLookupProvider {
  constructor(module, clazz) {
    this.module = module;
    this.Class = clazz;
    this.instance = null;
    this.$get.$inject = ['$injector'];
  }

  $get($injector) {
    //console.log('Get ' + this.Class.$name + ' in ' + this.module.name);
    let Impl = DI.findImplementation(this.Class);
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
