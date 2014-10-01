angular.module("taffer.directives")
    .directive("fmCalendar", [
        "$ocModal",
        function(modal) {
            return {
                restrict: "E",
                scope: {
                    mode: "@",
                    selected: "=",
                    eventdays: "=",
                    type: "@",
                    highlight: "@",
                    onMonthChange: "&",
                    onDayChange: "&",
                    disableFuture: "&"
                },
                link: function(scope, elem, attr) {
                    scope.noFuture = false;

                    // If selected is already populated, show that year/date/month
                    if(scope.selected && scope.selected.length > 0) {
                        if(scope.mode == "range") {
                            scope.currentDate = moment(scope.selected[0]);
                        } else {
                            scope.currentDate = moment(scope.selected);
                        }
                    }else {
                        scope.currentDate = moment();
                    }

                    scope.seedDate = scope.currentDate.clone().startOf("Month");

                    var dateRange = {};

                    if(scope.mode === "range" && scope.selected.length === 0) {
                        scope.selected = [];
                    }

                    if(attr.disableFuture) {
                        scope.noFuture = true;
                    }

                    if(scope.type === 'static') {
                        scope.isStatic = true;
                        scope.isClickable = false;
                    }else if(scope.type === 'static clickable') {
                        scope.isStatic = true;
                        scope.isClickable = true;
                    }else if(scope.type === 'no-click') {
                        scope.isStatic = false;
                        scope.isClickable = false;
                    }else {
                        scope.isStatic = false;
                        scope.isClickable = true;
                    }

                    // Helper Functions
                    function calculateDate(start, row, col) {
                        var daysToAdd = row * 7 + col;
                        return start.clone().add(daysToAdd, "Day");
                    };

                    function createCalendar() {
                        var startDate = scope.seedDate.clone().startOf("Month").startOf("Week");

                        //////// needed for loading events in events overview ////////
                        dateRange.startOfMonthUTC = scope.seedDate.clone().utc().startOf('Month').valueOf();
                        dateRange.endOfMonthUTC = scope.seedDate.clone().utc().endOf('Month').valueOf();
                        scope.$emit("create-cal", dateRange);

                        var calendar = [[],[],[],[],[]];

                        for(var i = 0; i < 5; i++) {
                            for(var x = 0; x < 7; x++) {
                                calendar[i][x] = calculateDate(startDate, i, x);
                            }
                        }

                        return calendar;
                    };

                    scope.cal = createCalendar();

                    // Scope Functions
                    scope.isInMonth = function(row, col) {

                        var testDate = scope.cal[row][col];
                        if(testDate.isSame(scope.seedDate, "Month")) {
                            return true;
                        }
                        return false;
                    };

                    scope.isDisabledFutureDate = function(row, col) {
                        if(attr.disableFuture) {
                            var workingDate = scope.cal[row][col];
                            if(workingDate.isAfter(moment())) {
                                return true;
                            }
                            return false; 
                        }
                        return false;
                    }

                    scope.previousMonth = function() {
                        scope.seedDate = scope.seedDate.subtract(1, "Month");
                        scope.cal = createCalendar();

                        if(scope.onMonthChange) {
                            scope.onMonthChange({date: scope.seedDate.format("YYYY-MM-DD")});
                        }

                        if(attr.disableFuture) {
                            scope.noFuture = false;
                        }
                    };

                    scope.nextMonth = function() {
                        scope.seedDate = scope.seedDate.add(1, "Month");
                        scope.cal = createCalendar();

                        if(scope.onMonthChange) {
                            scope.onMonthChange({date: scope.seedDate.format("YYYY-MM-DD")});
                        }

                        if(attr.disableFuture) {
                            if(scope.seedDate.month() == moment().month()) {
                                scope.noFuture = true;
                            }
                        }
                    };

                    scope.select = function(row, col) {
                        var m = scope.cal[row][col].format("YYYY-MM-DD");
                        var testM = scope.cal[row][col];

                        if(!attr.disableFuture || (attr.disableFuture && !testM.isAfter(moment()))) {
                            if(scope.onDayChange) {
                                scope.onDayChange({date: m});
                            }

                            if(scope.mode === "single") {
                                scope.selected = m;
                            } else {
                                if(scope.selected &&
                                    (scope.selected.length === 0 ||
                                        scope.selected.length === 2)) {
                                    scope.selected = [m];
                                } else {
                                    if(testM.isAfter(moment(scope.selected[0]))) {
                                        scope.selected.push(m);
                                    } else {
                                        var tmpArray = scope.selected;
                                        tmpArray.push(m);
                                        tmpArray.reverse();
                                        scope.selected = tmpArray;
                                    }
                                }
                            }
                        }
                    };

                    scope.isSelected = function(row, col) {
                        var testFormat = scope.cal[row][col].format("YYYY-MM-DD");
                        var testM = scope.cal[row][col];
                        if(scope.mode === "single") {
                            return testFormat === scope.selected;
                        } else {
                            if(scope.selected.indexOf(testFormat) != -1) {
                                return true;
                            }

                            if(scope.selected.length === 2) {
                                var s = moment(scope.selected[0]);
                                var e = moment(scope.selected[1]);

                                if(testM.isAfter(s) && testM.isBefore(e)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                    scope.hasEvent = function(day) {
                        var testFormat = day.format("D");
                        if(scope.eventdays) {
                            if(scope.eventdays[testFormat]) {
                                return true;
                            }
                        }
                        return false;
                    };

                    scope.isCurrentDay = function(day) {
                        if(scope.highlight && scope.highlight == 'true') {
                            if(day.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                                return true;
                            }
                        }
                        return false;
                    }
                },
                templateUrl: "templates/fm_calendar.html"
            }
        }
    ]);
