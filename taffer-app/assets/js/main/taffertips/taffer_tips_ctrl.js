angular.module("taffer.controllers")
.controller("TafferTipsCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "TIPS",
  "AuthService",
  "KeenIO",
  function(scope, state, params, api, TIPS, auth, keenIO) {
    scope.selectedTip = null;

    (function(tipList) {
      if(params.tipId) {
        for(var i = 0, len = tipList.length; i < len; i++) {
          if(tipList[i]._id == params.tipId) {
            scope.selectedTip = tipList[i];
          }
        }

        if(scope.selectedTip) {
          var index = TIPS.indexOf(scope.selectedTip);
          tipList.splice(index, 1);
        }

        scope.tips = tipList;
      } else {
        scope.tips = tipList;
      }
    })(TIPS);

    keenIO.addEvent('tipsRead', {
      user: auth.getUser()._id,
      bar: auth.getUser().barId
    })
    
    scope.$on("parent-back", function(event) {
      state.go("Main.Landing");
    });

  }
]);
