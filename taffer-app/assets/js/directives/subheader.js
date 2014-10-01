angular.module("taffer.directives").directive("subHeader", function() {
  return {
    restrict: 'E',
    scope: {
      subtitle: '@',
      bluetext: '@'
    },
    replace: true,
    template: '<div class="m-page-header" ng-class="{\'s-blue\': bluetext == \'true\'}"><p>{{subtitle}}</p></div>'
  }
});
