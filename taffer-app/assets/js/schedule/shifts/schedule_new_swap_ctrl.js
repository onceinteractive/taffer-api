angular.module("taffer.controllers")
.controller("ScheduleNewSwapCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "$timeout",
  "DataService",
  "$q",
  "$ocModal",
  "AuthService",
  "KeenIO",
  function(scope, state, stateParams, api, timeout, DataService, $q, modal, auth, keenIO) {
    scope.header.subTitle = "New Request";
    scope.header.mainTitle = scope.bar.name;
    scope.header.homeBtn = false;
    scope.header.addBtn = false;
    scope.header.cancelBtn = false;
    scope.header.saveBtn = false;
    scope.header.backBtn = true;
    scope.header.footerNav = false;

    //Scope Defaults
    scope.showErrors = false;
    scope.requestedUser = {};
    scope.requestedUser.firstName = "SELECT";
    scope.requestedUser.pictureURI = "img/question_mark.png";

    function getUserShifts(userID) {
        var deferred = $q.defer();

        api.get("shifts/user/" + userID + "/upcoming")
        .then(function(result) {
            var fShifts = [];

            result.data.map(function(x) {
                var dateStr = moment(x.startTimeUTC).format("M/D: h:mma");
                var endStr = moment(x.endTimeUTC).format("h:mma");

                var fShift = {
                    value: x,
                    label: dateStr + "-" + endStr
                }

                fShifts.push(fShift);
            });

            deferred.resolve(fShifts);
        }).catch(function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    function getUser(userID) {
        var deferred = $q.defer();

        api.get("users/" + userID).then(function(result) {
            deferred.resolve(result.data);
        }).catch(function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    if(stateParams.requestedUserId) {
        getUserShifts(stateParams.requestedUserId)
        .then(function(result) {
            if(result.length > 0) {
                scope.requestedUser = result[0].value.user;
                scope.requestedUser.future_shifts = result;
            }
        }).catch(function(err) {
            console.log(err);
        });
    }

    //Event Handlers
    scope.$on("parent-back", function(event) {
      state.go("Main.Schedule.ShiftSwap");
    });

    scope.setRequestedUser = function() {
      state.go("Main.Schedule.SelectUser", {myShift: scope.currentUserShift._id});
    };

    getUser(auth.getUser()._id)
    .then(function(currentUser) {
      scope.currentUser = currentUser;
      scope.currentUser.future_shifts = [];

      getUserShifts(scope.currentUser._id)
      .then(function(futureShifts) {
        scope.currentUser.future_shifts = futureShifts;
        if(stateParams.myShift) {
          scope.currentUser.future_shifts.map(function(x) {
            if(x.value._id === stateParams.myShift) {
                scope.currentUserShift = x.value;
            }
          });
        } else {
          scope.currentUserShift = null;
        }
      });
    });

    //Submit Request
    scope.submitSwapRequest = function() {
      if(scope.shiftRequestForm.$valid) {
        var data = {
            switchWith: scope.requestedUser._id,
            requestedShift: scope.requestedUserShift._id,
            originalShift: scope.currentUserShift._id,
            requestReason: scope.shiftSwapMessage
        }

        api.post("swaps", data).then(function(result) {
            keenIO.addEvent('shiftSwapNew', {
                user: auth.getUser()._id,
                bar: auth.getUser().barId,
                switchWith: scope.requestedUser._id,
                requestedShift: scope.requestedUserShift._id,
                originalShift: scope.currentUserShift._id,
                requestReasonLength: scope.shiftSwapMessage ? scope.shiftSwapMessage.length : 0
            })

            state.go("Main.Schedule.ShiftSwap");
        }).catch(function(err) {
            console.log(err);
        });
      } else {
        if(scope.shiftRequestForm.$error.required) {
          feedback("Please select two shifts you would like to swap.");
        } else {
          feedback("Something went wrong...");
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
    };

  }
]);
