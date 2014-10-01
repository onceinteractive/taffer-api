angular.module("taffer.controllers")
.controller("MyTeamCtrl", [
  "$scope",
  "$state",
  "api",
  "MEMBERS",
  "ROLES",
  "PERMISSIONS",
  "APPROVALS",
  function(scope, state, api, MEMBERS, ROLES, PERMISSIONS, APPROVALS) {
    scope.members = MEMBERS.data;
    scope.roleObject = ROLES.data;
    scope.permissions = PERMISSIONS.data;
    scope.approvals = APPROVALS.data;

    (function() {
      window.scrollTo(0,0);
    })();

    if(ROLES.data !== "") {
        scope.roleKeys = Object.keys(ROLES.data);
    } else {
      scope.roleKeys = [];
    }

    scope.member = {};
    scope.newPermissions = null;

    scope.showInviteModal = true;

    scope.foundContacts = [];
    scope.selectedContacts = {};

    scope.updateShowInviteModal = function(toShow) {
      scope.showInviteModal = toShow;
    }

    scope.updateMember = function(member) {
      scope.member = member;
    };

    scope.updateNewPermissions = function(newPermissions) {
      scope.newPermissions = newPermissions;
    };

    scope.updateFoundContacts = function(contacts) {
      scope.foundContacts = contacts;
    };

    scope.clearSelectedContacts = function() {
      scope.selectedContacts = {};
    };

    scope.updateMembers = function(newUser) {
      scope.members.push(newUser);
    };

    scope.removeApproval = function(newUser) {
      var index = scope.approvals.indexOf(newUser);
      scope.approvals.splice(index, 1);
    };
  }
]);
