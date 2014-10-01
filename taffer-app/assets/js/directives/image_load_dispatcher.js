angular.module("taffer.directives").directive("imageLoadDispatcher", function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        scope.afterImageLoad();
      });
    }
  }
});
