# angular-es6-di [![JSPM](https://img.shields.io/badge/JSPM-angular--es6--di-db772b.svg?style=flat-square)](http://kasperlewau.github.io/registry/#/?q=angular-es6-di)
Better dependency injection for Angular 1.x

## Installation
```bash
jspm install angular-es6-di
```
Requires either Traceur or Babel with `es7.decorators` enabled.

## Usage
ES6 brings classes with inheritance support. It's nice to write controllers and services in classes and combine subclassing with Angular dependency override. This library lets you do just that. Write a controller like this:
```js
import { Controller } from 'angular-es6-di';

@Controller(['$scope'])
export default class MyController {
  constructor($scope) {
    this.$scope = $scope;
  }
}
```
And to register it with your module, use:
```js
import MyController from 'MyController';

let app = angular.module('app', []);
app.use(MyController);
```
As you can see the dependencies for `MyController` are stated in an array passed to the `@Controller(...)` annotation. If your controller has no dependency, you may write `@Controller` as a short form for `@Controller([])`.

Sometimes your Angular services follow an interface. Now you'll be able to integrate them into Angular with ease. Suppose you have a logging protocol, it can be written in `angular-es6-di` as:
```js
import { Service } from 'angular-es6-di';

@Service
export default class Logger {
  log(msg) {
    throw new Error('Not implemented');
  }
}
```
And in an implementation:
```js
import { Service } from 'angular-es6-di';
import Logger from 'Logger';

@Service
export default class ConsoleLogger extends Logger {
  log(msg) {
    console.log(msg);
  }
}
```
Note the `extends` statement. All services along the prototype chain will be overriden by this service if it was specified in the `module.use(...)` call, and the override happens in the same order as the order of services in the parameters to `use`. If multiple `use` calls are present, succeeding calls will override previous ones if possible.

Your other controllers or services can specify a dependency on `Logger`. At runtime an implementation will be chosen based on the `.use(...)` statements in your module.
```js
import Logger from 'Logger';

@Controller([Logger])
export default class LoggingController {
  constructor(logger) {
    this.logger = logger;
  }
}
```
If you have multiple implementations of `Logger`, you'll be able to pick one for use in your app just by changing the parameters to the `use` call.
```js
import ConsoleLogger from 'ConsoleLogger';
import FileLogger from 'FileLogger';

let app = angular.module('app', []);
// Pick one :D
// app.use(FileLogger);
app.use(ConsoleLogger);
```
