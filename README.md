# angular-es6-di
Better dependency injection for Angular 1.x

## Installation
```bash
jspm install angular-es6-di
```
Requires either Traceur or Babel with `es7.decorators` enabled.

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
