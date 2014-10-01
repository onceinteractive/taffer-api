angular.module("taffer.controllers")
.controller("MyTeamContactsCtrl", [
  "$scope",
  "$state",
  "api",
  function(scope, state, api) {

    (function() {
      window.scrollTo(0,0);
    })();

    scope.done = function() {
      angular.forEach(scope.selectedContacts, function(value, key) {
        if(!value) {
          delete scope.selectedContacts[key];
        }
      });
      state.go("Main.MyTeam.Invite");
    }

    scope.cancel = function() {
      scope.clearSelectedContacts();
      state.go("Main.MyTeam.Invite")
    }

  }
]);
