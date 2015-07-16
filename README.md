# angular-es6-di [![JSPM](https://img.shields.io/badge/JSPM-angular--es6--di-db772b.svg?style=flat-square)](http://kasperlewau.github.io/registry/#/?q=angular-es6-di)
Better dependency injection for Angular 1.x, supports services, controllers, and values.

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

#### Controller/Service name
`angular-es6-di` lets you do away with magic strings. If you do need to access the raw controller/service name used in registering the class with Angular, use `MyController.$name`.

#### Compatibility with string-style injections
`angular-es6-di` interoperates well with string-based injections. That means you can refer to your existing services by string and even use mixed string/class dependencies. The same applies to services.
```js
@Controller([ClassDependency, 'string.dependency'])
```

#### Automatic namespacing
The library automatically prefixes your class names with a random string during service/controller registration, thereby eliminating the issue of class name collision.

### Services
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

### Values
Value injection is again achieved through ES6 classes. Each value we want to inject corresponds to a different class. By annotating the class you'll be able to use it in services.
```js
@Value export class UploadURL { }

@Service([UploadURL])
export class MyUploader {
  constructor(url) { ... }
}
```
The Angular `module.value` method is patched to recognize annotated classes in addition to magic strings.
```js
import { UploadURL, MyUploader } from 'Uploader';

let app = angular.module('app', []);
app.use(MyUploader);
app.value(UploadURL, 'www.example.com');
```
#### Default values
`angular-es6-di` supports default value injection. The syntax is as follows:
```js
@Value @Default('something') export class MyValue { }
```
If you do not specify a value for `MyValue` using `module.value`, `MyValue` will automatically take on the value of `'something'` whenever it is required as a dependency in your services/controllers.

### Name overriding
If you absolutely need to hardcode the name of a class as it is exposed to Angular, you can override the name using the `@Name` annotation:
```js
@Controller
@Name('mycontroller')
class NameIsUselessHere {
}
```
Then you can refer to the controller by the name `mycontroller`.

### Directives
You can also declare directives.
```js
import { Directive } from 'angular-es6-di';

@Directive
class MyDirective {
  constructor() {
    this.template = '...';
  }
}
```
Directives enjoy the same support and syntax of dependency injection. Since directives are almost always referred to directly in html, the name of the directive is simply the snake-case version of its class name: `my-directive`, and you would use it like this: `<div my-directive>...</div>`.

Directives can also have their names overridden. Just use `@Name`.
```js
@Directive
@Name('newDirective')
class MyDirective { ... }
```
```html
<div new-directive>...</div>
```
