angular.module("taffer.controllers")
.controller("ScheduleOverviewCtrl", [
    "$scope",
    "$state",
    "$stateParams",
    "$http",
    "$timeout",
    "$q",
    "$ocModal",
    "ScheduleService",
    "USERS",
    "AuthService",
    function(scope, state, params, http, timeout, $q, modal, schedule, USERS, auth) {
        scope.auth = auth;
        scope.header.subTitle = "Schedule Overview";
        scope.header.mainTitle = scope.bar.name;
        scope.header.homeBtn = true;
        scope.header.addBtn = false;
        scope.header.cancelBtn = false;
        scope.header.saveBtn = false;
        scope.header.backBtn = false;
        scope.header.footerNav = true;

        scope.hasSchedules = true;
        scope.weekCounter = 0;
        scope.published = false;

        function getDays(seed) {
            var days = [];
            days.push(seed.clone());

            var i = 0;
            while(i < 6) {
                days.push(seed.clone().add(i + 1, "day"));
                i++;
            }

            return days;
        }

        scope.weekTitle = function(){
            if(scope.weekCounter == 0) {
                scope.whichWeek = "Current Week";
            } else if(scope.weekCounter == -1){
                scope.whichWeek = 'Last Week'
            } else if(scope.weekCounter == 1){
                scope.whichWeek = 'Next Week'
            } else if (scope.weekCounter < 0){
                scope.whichWeek = ( -1 * scope.weekCounter ) + ' weeks ago'
            } else {
                scope.whichWeek = scope.weekCounter + ' weeks from now'
            }
        }

        function fetchShifts(start, end) {
            schedule.getShifts(start, end)
                .then(function(result) {
                    return result.data
                })
                .then(schedule.prepareShifts)
                .then(function(shifts) {
                    scope.shifts = shifts;
                    scope.published = shifts.published;
                });
        };

        function fetchTimeOff(start, end) {
            schedule.getUpcomingTimeOff(start, end)
                .then(function(result) { return result.data })
                .then(schedule.prepareTimeOffs)
                .then(function(timeoffs) {
                    // scope.timeoffs = timeoffs;

                    var approvedTimeOffs = {}

                    Object.keys(timeoffs).forEach(function(userId){
                        var timeOffs = []

                        timeoffs[userId].timeoffs.forEach(function(timeoff){
                            if(timeoff.status == 'approved'){
                                timeOffs.push(timeoff)
                            }
                        })

                        if(timeOffs.length > 0){
                            approvedTimeOffs[userId] = { timeoffs: timeOffs }
                        }
                    })

                    scope.timeoffs = approvedTimeOffs
                });
        }

        if(params.weekStart && params.weekEnd) {
            var seed = moment(parseInt(params.weekStart));
            var start = seed.clone();
            var end = moment(parseInt(params.weekEnd));

            scope.weekCounter = (params.weekStart - moment().startOf("isoweek")) / 604800000;
        } else {
            var seed = moment().startOf("isoweek");
            var start = seed.clone();
            var end = seed.clone().endOf("isoweek");
        }

        scope.days = getDays(seed);
        scope.users = USERS;
        scope.shifts = {};
        scope.timeoffs = {};

        // Prepare Shifts for quick lookup
        fetchShifts(start.valueOf(), end.valueOf());
        fetchTimeOff(start.valueOf(), end.valueOf());

        // scope.whichWeek = "Current Week";
        scope.weekTitle()

        scope.hasShift = function(id, index) {
            var result = false;
            var day = scope.days[index].day();
            if(!scope.shifts[id]) return result;

            scope.shifts[id].shifts.map(function(x) {
                if(moment(x.startTime).day() === day) {
                    result = true;
                }
            });

            return result;
        }

        scope.showPublishButton = function() {
            if(auth.hasPermission('schedule', 'scheduleUsers')) {
                if(scope.weekCounter < 0) {
                    return false;
                } else {
                    return !scope.published;
                }
            } else {
                return false;
            }
        };

        scope.getShift = function(id, index) {
            var shift = {};
            var day = scope.days[index].day();
            if(!scope.shifts[id]) return shift;

            scope.shifts[id].shifts.map(function(x) {
                if(moment(x.startTime).day() === day) {
                    shift = x;
                }
            });

            return shift;
        }

        scope.hasTimeOff = function(id, index) {
            var result = false;
            var day = scope.days[index].day();
            if(!scope.timeoffs[id]) return result;

            scope.timeoffs[id].timeoffs.map(function(x) {
                if(moment(x.startTime).day() === day) {
                    result = true;
                }
            });

            return result;
        };

        scope.getTimeOff = function(id, index) {
            var timeoff = {};
            var day = scope.days[index].day();
            if(!scope.timeoffs[id]) return timeoff;

            scope.timeoffs[id].timeoffs.map(function(x) {
                if(moment(x.startTime).day() === day) {
                    timeoff = x;
                }
            });

            return timeoff;
        };

        // Go Forward a Week
        scope.next = function() {
            scope.weekCounter++
            scope.weekTitle()

            scope.shifts = {};
            scope.timeoffs = {};

            seed.add(1, "week");
            start = seed.clone();
            end = seed.clone().endOf("isoweek");

            scope.days = getDays(seed);
            fetchShifts(start.valueOf(), end.valueOf());
            fetchTimeOff(start.valueOf(), end.valueOf());
        };

        // Go Back a Week
        scope.back = function() {
            scope.weekCounter--
            scope.weekTitle()

            scope.shifts = {};
            scope.timeoffs = {};

            seed.subtract(1, "week");
            start = seed.clone();
            end = seed.clone().endOf("isoweek");

            scope.days = getDays(seed);
            fetchShifts(start.valueOf(), end.valueOf());
            fetchTimeOff(start.valueOf(), end.valueOf());
        };

        scope.editShift = function(userID, dayIndex) {
            console.log("Edit Shift Clicked");
            if(auth.hasRole("manager") || auth.hasRole("owner")) {
                console.log("Got Here");
                var shift = scope.getShift(userID, dayIndex);
                var timeoff = scope.getTimeOff(userID, dayIndex);
                var m = scope.days[dayIndex];

                var params = {
                    userID: userID,
                    date: m.format("YYYY-MM-DD"),
                    weekStart: start.valueOf(),
                    weekEnd: end.valueOf()
                };

                if(!$.isEmptyObject(shift)) {
                    console.log(shift);
                    params.shiftID = shift.id;
                    params.shiftStart = shift.startTime.getTime();
                    params.shiftEnd = shift.endTime.getTime();
                    params.isOpening = shift.isOpening;
                    params.isClosing = shift.isClosing;
                }

                if(!$.isEmptyObject(timeoff)) {
                    params.timeoffID = timeoff.id;
                    params.timeoffIsAllDay = timeoff.isAllDay;
                    params.timeoffStatus = timeoff.status;
                }

                state.go("Main.Schedule.Shift", params);
            } else {
                // Do Nothing
            }
        };

        scope.save = function() {
            scope.$broadcast("sch-save");
        };

        scope.publish = function() {
            scope.published = true;
            schedule.publish(start.valueOf(), end.valueOf())
                .then(function(data) {
                    fetchShifts(start.valueOf(), end.valueOf());
                }, function(error) {
                    scope.published = false;
                    console.log(error);
                });
        };

        scope.isPublished = function() {
            console.log()
        };


        // Helper Functions
        function getTitle(startTime,endTime) {
            var title = "NEXT WEEK";
            var currentTime = new Date().getTime();
            var startDate = new Date(startTime);
            var endDate = new Date(endTime);
            if (inRange(currentTime,startTime,endTime)) {
                title = "CURRENT WEEK";
            } else if (compareDates(currentTime,endTime) == 1) {
                title = "ARCHIVED";
            }

            return title;
        }

    }
]);
