angular.module("taffer.controllers")
.controller("TileCtrl", [
  "$scope",
  "$state",
  "TipService",
  function(scope, state, tipService) {
    scope.tips = [];
    scope.schedPromos = [];

    // Once upon a time, there was more here.

    (function() {
      tipService.getAll().then(function(data) {
        // Randomize the array
        function shuffle(o){
          for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
          return o;
        };

        scope.tips = shuffle(data.slice(0, 10));
      }, function(error) {
        console.log(error);
      });
    })();

    scope.selectTip = function(tip) {
      if(tip) {
        state.go('Main.TafferTips', {tipId: tip._id});
      } else {
        state.go('Main.TafferTips');
      }
    };

  }
]);
