// ************************** LIVE TILES ***********************************
angular.module("taffer.directives").directive("liveTile", function() {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var options = {mode: attrs.mode, speed: attrs.speed, delay: attrs.delay, direction: attrs.direction, animationDirection: attrs.aniDirection};
      $(element).liveTile(options);
      scope.$on('$destroy', function() {
        $(element).liveTile("destroy", true);
      });
    }
  }
});

angular.module("taffer.directives").directive("repeatDone", function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, liveTileCtrl) {
      var parentEl = element.parent();

      if(scope.$last) {
        var tileData = $(parentEl).data("LiveTile");
        $(parentEl).liveTile("rebind", tileData);
      }

    }
  }
});

// ************** LARGE LIVE TILES ****************
angular.module("taffer.directives").directive("tafferTile", function() {
  return {
    restrict: 'E',
    controller: 'TileCtrl',
    transclude: true,
    templateUrl: 'templates/taffer-tile.html'
  }
});
