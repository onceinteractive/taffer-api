angular.module("taffer.controllers")
.controller("ScheduleCtrl", [
  "$scope",
  "$state",
  "$http",
  "AuthService",
  function(scope, state, http, auth) {

    //append footerNav to header config object, only used by schedule views
    scope.header.footerNav = true;

    scope.scheduleId = null;
    scope.schedIds = [];
    scope.currentIndex = null;
  }
]);
