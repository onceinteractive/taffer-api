angular.module("taffer.controllers")
.controller("MyTeamProfileCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "$filter",
  "api",
  "cordovaService",
  "$ocModal",
  "AuthService",
  "KeenIO",
  function(scope, state, params, filter, api, cordovaService, modal, auth, keenIO) {

    (function() {
      window.scrollTo(0,0);
    })();

    scope.memberCopy = angular.copy(scope.member);

    if(scope.memberCopy && scope.memberCopy.role) {
      var role = scope.memberCopy.role.toLowerCase();
      scope.memberCopy.role = filter('capitalize')(role);
    }

    scope.cancel = function() {
      scope.updateMember(null);
      scope.updateNewPermissions(null);
      state.go("Main.MyTeam.List");
    }

    scope.sendMessage= function() {
      state.go("Main.Messages.NewMessage", {
        userId: scope.member._id,
        firstName: scope.member.firstName,
        lastName: scope.member.lastName,
        lastpage: state.current.name}
      );
    }

    scope.setPermissions = function() {
      state.go("Main.MyTeam.Permissions");
    }

    scope.lockMember = function() {
      if(scope.memberCopy) {
        if(scope.memberCopy.locked) {
          scope.memberCopy.locked = false;
        } else {
          scope.memberCopy.locked = true;
        }
      }
    }

    scope.deactivate = function() {
      cordovaService.dialogs.confirm(
        'Deactivate user?', 'Deactivate ' + scope.member.firstName + ' ' + scope.member.lastName + '?',
        function() {
          var promise = api.delete('users/' + scope.member._id + '/deactivate')
          promise.success(function(data, status, headers, config) {

            var index = scope.members.indexOf(scope.member)
            scope.members.splice(index, 1)

            keenIO.addEvent('myTeamDeactivate', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              deactivatedUser: scope.member._id
            })

            state.go('Main.MyTeam.List')
          })

          promise.error(function(data, status, headers, config) {
            modal.open({
              url: "views/modals/error_message.html",
              init: {
                errorMessage: 'Something has gone wrong deactivating this user - please try again later.'
              },
              cls: 'fade-in'
            })
          })
        },
        null
      )
    }

    scope.save = function() {
      if(scope.profileForm.$valid) {

        if(scope.newPermissions)  {
          scope.memberCopy.permissions = scope.newPermissions;
        } else{
          // The endpoint doesn't want permissions unless they've actually been changed
          // Copy the existing, and temporarily set them to null on the object.
          // After saving, reset the permissions on the member.
          scope.memberCopy.permissions = null;
        }

        var promise = api.put("users/" + scope.member._id, scope.memberCopy);
        promise.success(function(data, status, headers, config) {
            var currentUser = auth.getUser();
          if(currentUser._id == scope.member._id) {
            currentUser.firstName = scope.memberCopy.firstName;
            scope.member.firstName = scope.memberCopy.firstName;
            currentUser.lastName = scope.memberCopy.lastName;
            scope.member.lastName = scope.memberCopy.lastName;
            currentUser.email = scope.memberCopy.email;
            scope.member.email = scope.memberCopy.email;
            currentUser.role = scope.memberCopy.role;
            scope.member.role = scope.memberCopy.role;
            if(scope.memberCopy.permissions) {
              currentUser.permissions = scope.memberCopy.permissions;
              scope.member.permissions = scope.memberCopy.permissions;
            }
            
            auth.setUser(currentUser);
          }

          keenIO.addEvent('myTeamSave', {
            user: auth.getUser()._id,
            bar: auth.getUser().barId,
            editedUser: scope.member._id
          })

          scope.updateNewPermissions(null);
          state.go("Main.MyTeam.List");
        });

        promise.error(function(data, status, headers, config) {
          console.log(data);
          console.log(status);
        });
      } else {
        if(scope.profileForm.firstName.$invalid) {
          feedback("You must enter a first name.");
        } else if(scope.profileForm.lastName.$invalid) {
          feedback("You must enter a last name.");
        } else if(scope.profileForm.email.$invalid) {  
          feedback("You must enter a valid email.");
        } else {
          feedback("Something is wrong with the data you've provided.");
        }

      }
    };

    function feedback(errorMessage) {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: errorMessage
        }
      });
    }

  }
]);
