angular.module("taffer.controllers")
.controller("PreshiftListCtrl", [
  "$scope",
  "$state",
  "$ocModal",
  "api",
  "KeenIO",
  function(scope, state, modal, api, keenIO) {

    scope.$on("parent-create", function() {
      state.go("Main.Preshift.New");
    });

    scope.view = function(message) {
      scope.updateSelectedMessage(message);
      state.go("Main.Preshift.View");

      keenIO.addEvent('preshiftRead', {
        user: scope.auth.getUser()._id,
        bar: scope.auth.getUser().barId,
        preshift: message._id
      })
    };

    scope.getCreatedDate = function(time) {
      if(time) {
        return moment(time).fromNow();
      } else {
        return moment('2000-01-01').fromNow();
      }
    }

  }
]);
