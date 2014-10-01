angular.module("taffer.controllers")
.controller("MyTeamPermissionsCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  function(scope, state, params, api) {
    scope.memberPerm = {};

    (function() {
      window.scrollTo(0,0);
    })();

    (function() {
      if(scope.member) {
        if(scope.newPermissions) {
          scope.memberPerm = scope.newPermissions;
        } else {
          var permPromise = api.get("users/" + scope.member._id + "/permissions");
          permPromise.success(function(data, status, headers, config) {
            scope.memberPerm = data;
          });

          permPromise.error(function(data, status, headers, config) {
            console.log(data);
            console.log(status);
          });
        }
      }
    })();

    scope.back = function() {
      scope.updateNewPermissions(scope.memberPerm);
      state.go("Main.MyTeam.Profile");
    }

    scope.checkForProperty = function(permissionName, permKey) {
      if(!scope.memberPerm[permissionName]) {
        scope.memberPerm[permissionName] = {};
      }
    }


  }
]);
