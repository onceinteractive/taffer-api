angular.module("taffer.controllers")
.controller("ScheduleShiftCtrl", [
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
        // NEW STUFF HERE
        console.log(stateParams);

        scope.selectedDate = moment(stateParams.date).toDate();

        ///////////////////

        scope.header.subTitle = "Edit Shift";
        //scope.header.mainTitle = "Edit Shift";
        scope.header.homeBtn = false;
        scope.header.addBtn = false;
        scope.header.cancelBtn = false;
        scope.header.saveBtn = true;
        scope.header.backBtn = true;
        scope.header.footerNav = false;

        scope.isOpening = false;
        scope.isClosing = false;
        scope.startTime = null;
        scope.endTime = null;
        scope.isActive = true;

        scope.$on("parent-back", function(event) {
            state.go("Main.Schedule.Overview", {weekStart: stateParams.weekStart, weekEnd: stateParams.weekEnd});
        });

        scope.delete = function() {
          scope.$broadcast("shift-delete");
        }

        if (stateParams.timeoffID) {
            // Get Time Off
        }

        if (stateParams.shiftID) {
            scope.startTime = moment(parseInt(stateParams.shiftStart)).format("HH:mm");
            scope.endTime = moment(parseInt(stateParams.shiftEnd)).format("HH:mm");
            scope.originalStartTime = moment(parseInt(stateParams.shiftStart)).format("HH:mm");
            scope.originalEndTime = moment(parseInt(stateParams.shiftEnd)).format("HH:mm");
            scope.isOpening = stateParams.isOpening === 'true' ? true : false;
            scope.isClosing = stateParams.isClosing === 'true' ? true : false;
        }

        scope.$on("parent-save", function(event) {
            if(scope.shiftForm.$valid) {
                // Date
                var date = moment(stateParams.date).startOf("day");
                var startSplit = scope.startTime.split(":");
                var endSplit = scope.endTime.split(":");

                // Start
                var startTime = date.clone()
                    .hours(startSplit[0])
                    .minutes(startSplit[1])
                    .valueOf();

                // End
                var endTime = date.clone()
                    .hours(endSplit[0])
                    .minutes(endSplit[1])
                    .valueOf();

                if(checkTimeOffConflict(startTime, endTime)) {
                    // Save
                    data = {
                        startTimeUTC: startTime,
                        endTimeUTC: endTime,
                        isOpening: scope.isOpening,
                        isClosing: scope.isClosing,
                        user: stateParams.userID,
                        weekStart: stateParams.weekStart,
                        weekEnd: stateParams.weekEnd
                    }

                    if(stateParams.shiftID) {
                        api.put("shifts/" + stateParams.shiftID, data)
                        .then(function(result) {
                            keenIO.addEvent('shiftEdit', {
                                user: auth.getUser()._id,
                                bar: auth.getUser().barId,
                                startTimeUTC: startTime,
                                endTimeUTC: endTime,
                                isOpening: scope.isOpening,
                                isClosing: scope.isClosing,
                                user: stateParams.userID,
                                weekStart: stateParams.weekStart,
                                weekEnd: stateParams.weekEnd
                            })

                            state.go("Main.Schedule.Overview", {weekStart: stateParams.weekStart, weekEnd: stateParams.weekEnd});
                        }).catch(function(err) {
                            console.log(err);
                        });
                    } else {
                        api.post("shifts", data)
                        .then(function(result) {
                            keenIO.addEvent('shiftNew', {
                                user: auth.getUser()._id,
                                bar: auth.getUser().barId,
                                startTimeUTC: startTime,
                                endTimeUTC: endTime,
                                isOpening: scope.isOpening,
                                isClosing: scope.isClosing,
                                user: stateParams.userID,
                                weekStart: stateParams.weekStart,
                                weekEnd: stateParams.weekEnd
                            })

                            state.go("Main.Schedule.Overview", {weekStart: stateParams.weekStart, weekEnd: stateParams.weekEnd});
                        }).catch(function(err) {
                            console.log(err);
                        });
                    }
                } else {
                    showModal("This shift conflicts with an approved or pending time off request.");
                }
            } else {
                if(scope.shiftForm.startTime.$invalid) {
                    showModal("You must select a start time.");
                } else if(scope.shiftForm.endTime.$invalid) {
                    showModal("You must select an end time.");
                } else {
                    showModal("Something went wrong...");
                }
            }
        });

        function checkTimeOffConflict(startUTC, endUTC) {
            return true;
        };

        function convert24to12(militaryTime) {
            var time = militaryTime.split(":");
            return showTheHours(time[0]) + showZeroFilled(time[1]) + showAmPm();

            function showTheHours(theHour) {
                if(theHour < 10) {
                    theHour = theHour.substr(1,2);
                }
                return (theHour > 0 && theHour < 13) ? theHour : (theHour == 0) ? 12 : theHour-12;
            }

            function showZeroFilled(inValue) {
                return (inValue.length == 2) ? ":" + inValue : ":0" + inValue;
            }

            function showAmPm() {
                return (time[0] < 12) ? "am" : "pm";
            }
        };

        function convert12to24(timeStr) {
            var meridian = timeStr.substr(timeStr.length-2).toLowerCase();
            var hours =  timeStr.substr(0, timeStr.indexOf(':'));
            var minutes = timeStr.substr(timeStr.indexOf(':')+1, 2);
            if (meridian=='pm') {
                if (hours < 12) {
                    hours=hours*1+12;
                } else {
                    hours = (minutes!='00') ? '0' : '24' ;
                }
            }

            if(hours.length < 2) {
                hours = '0' + hours;
            }

            return hours+':'+minutes;
        };

        function showModal(errorMessage) {
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
