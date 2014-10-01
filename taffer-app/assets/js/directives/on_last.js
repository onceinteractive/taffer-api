angular.module("taffer.directives").directive("onLastElement", function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // This directive will fire your function after the last
      // element has been called in an ng-repeat.
      if(scope.$last) {
        $timeout(function() {
          scope.onLastElement();
        });
      }
    }
  }
});
