angular.module("taffer.controllers")
.controller("MyTeamListCtrl", [
  "$scope",
  "$state",
  "api",
  function(scope, state, api) {

    (function() {
      window.scrollTo(0,0);
    })();

    scope.viewProfile = function(member) {
      scope.updateMember(member);
      state.go("Main.MyTeam.Profile");
    };

    scope.$on("parent-create", function() {
      state.go("Main.MyTeam.Invite");
    });

    scope.approve = function(newUser) {
      var promise = api.put("users/" + newUser._id + "/approve");
      promise.success(function(data, status, headers, config) {
        scope.updateMembers(newUser);
        scope.removeApproval(newUser);
      });

      promise.error(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
      });
    };

    scope.deny = function(newUser) {
      var promise = api.delete("users/" + newUser._id + "/deactivate");
      promise.success(function(data, status, headers, config) {
        scope.removeApproval(newUser);
      });

      promise.error(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
      });
    };

  }
]);
