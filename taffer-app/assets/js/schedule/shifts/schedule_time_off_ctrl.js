angular.module("taffer.controllers")
.controller("ScheduleTimeOffCtrl", [
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

    scope.header.subTitle = "Time Off Request";
    scope.header.mainTitle = scope.bar.name;
    scope.header.homeBtn = false;
    scope.header.addBtn = false;
    scope.header.cancelBtn = false;
    scope.header.saveBtn = true;
    scope.header.backBtn = true;
    scope.header.footerNav = false;

    scope.requestErorr = false;
    scope.timeError = false;
    scope.noTimeError = false;
    scope.isAllDay = false;
    scope.timeOff = {};

    //Event Handlers
    scope.$on("parent-back", function(event) {
      state.go("Main.Schedule.ShiftSwapNew");
    });

    scope.$on("parent-save", function(event) {
      var selectedUTC = moment(scope.selectedDate);

      if(scope.isAllDay) {
        scope.timeOff.startTime = "00:00";
        scope.timeOff.endTime = "23:59";
      }

      if (!scope.toRequestForm.$valid) {
        if(scope.toRequestForm.startTime.$invalid) {
          feedback("You must select a start time.");
        } else if(scope.toRequestForm.endTime.$invalid) {
          feedback("You must select an end time.");
        } else {
          feedback("You must enter a start and end time.");
        }
      } else {
        var startSplit = scope.timeOff.startTime.split(":");
        var endSplit = scope.timeOff.endTime.split(":");

        var startTimeUTC = selectedUTC.clone()
            .add('hours', startSplit[0])
            .add('minutes', startSplit[1]);
        var endTimeUTC = selectedUTC.clone()
            .add('hours', endSplit[0])
            .add('minutes', endSplit[1]);

        if (endTimeUTC.valueOf() < startTimeUTC.valueOf()) {
            feedback("A shift cannot start before it ends.");
        } else if(checkConflict()) {
            data = {
                approvalStatus: 'pending',
                startTimeUTC: startTimeUTC.valueOf(),
                endTimeUTC: endTimeUTC.valueOf(),
                requestReason: scope.timeOffMessage,
                allDay: scope.isAllDay
            }

            api.post("timeoff", data)
            .then(function(result) {
                keenIO.addEvent('timeOffRequestNew', {
                    user: auth.getUser()._id,
                    bar: auth.getUser().barId,
                    startTimeUTC: startTimeUTC.valueOf(),
                    endTimeUTC: endTimeUTC.valueOf()
                })

                state.go("Main.Schedule.ShiftSwap");
            }).catch(function(err) {
                console.log(err);
            });
        } else {
            feedback("This request conflicts with a pending or approved timeoff request.");
        }
      }
    });

    function checkConflict() {
        return true;
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
