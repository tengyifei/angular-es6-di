let dependencyMap = new Map();

export default class DependencyManager {
  static findImplementation(clazz) {
    return dependencyMap.get(clazz);
  }

  static bind(iface) {
    return { to: impl => dependencyMap.set(iface, impl) };
  }
}
