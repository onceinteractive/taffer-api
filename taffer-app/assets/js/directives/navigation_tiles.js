angular.module("taffer.directives").directive("largeTile", function() {
  return {
    restrict: 'E',
    scope: {
      tileTitle: '@',
      icon: '@'
    },
    replace: true,
    transclude: true,
    templateUrl: 'templates/large-tile.html'
  }
});

angular.module("taffer.directives").directive("smallTile", function() {
  return {
    restrict: 'E',
    scope: {
      tileTitle: '@',
      icon: '@'
    },
    replace: true,
    templateUrl: 'templates/small-tile.html'
  }
});
