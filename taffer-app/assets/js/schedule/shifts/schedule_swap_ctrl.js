angular.module("taffer.controllers")
    .controller("ScheduleSwapCtrl", [
        "$scope",
        "$state",
        "$stateParams",
        "api",
        "$timeout",
        "DataService",
        "$q",
        "filterFilter",
        "$ocModal",
        "SWAPS",
        "TIMEOFF",
        "AuthService",
        "KeenIO",
        function(scope, state, stateParams, api, timeout, DataService, $q, filterFilter, modal, SWAPS, TIMEOFF, auth, keenIO) {
            scope.auth = auth;
            scope.header.subTitle = "Requests Overview";
            scope.header.mainTitle = scope.bar.name;
            scope.header.homeBtn = true;
            scope.header.addBtn = true;
            scope.header.cancelBtn = false;
            scope.header.saveBtn = false;
            scope.header.backBtn = false;
            scope.header.footerNav = true;

            scope.unfilteredSwaps = {
                pending: [],
                approved: [],
                declined: []
            };
            scope.swaps = {
                pending: [],
                approved: [],
                declined: []
            };

            scope.requestError = false;

            var windowHeight = window.innerHeight - 50;
            scope.requestsContainerStyle =  {"min-height" : windowHeight};

            //Event Handlers
            scope.$on("parent-create", function(event) {
                state.go("Main.Schedule.ShiftSwapNew");
            });

            //Filters
            scope.activeFilter = "viewAll";
            scope.getActiveClass = function(thisFilter) {
                if (scope.activeFilter == thisFilter) {
                    return true;
                }
                return false;
            }
            scope.viewSwaps = function() {
                scope.activeFilter = "viewSwaps";
                scope.swaps.pending = filterFilter(scope.unfilteredSwaps.pending,{type:"swap"});
                scope.swaps.approved = filterFilter(scope.unfilteredSwaps.approved,{type:"swap"});
                scope.swaps.declined = filterFilter(scope.unfilteredSwaps.declined,{type:"swap"});
            }
            scope.viewTimeOff = function() {
                scope.activeFilter = "viewTimeOff";
                scope.swaps.pending = filterFilter(scope.unfilteredSwaps.pending,{type:"timeOff"});
                scope.swaps.approved = filterFilter(scope.unfilteredSwaps.approved,{type:"timeOff"});
                scope.swaps.declined = filterFilter(scope.unfilteredSwaps.declined,{type:"timeOff"});
            }
            scope.viewAll = function() {
                scope.activeFilter = "viewAll";
                scope.swaps.pending = filterFilter(scope.unfilteredSwaps.pending,undefined);
                scope.swaps.approved = filterFilter(scope.unfilteredSwaps.approved,undefined);
                scope.swaps.declined = filterFilter(scope.unfilteredSwaps.declined,undefined);
            }

            //Tab Panel
            scope.tabSelected = "#tab1";
            scope.tabChange = function(e) {
                if (e.target.nodeName === 'DIV') {
                    scope.tabSelected = e.target.getAttribute("data-tab");
                    e.preventDefault();
                }
            }

            //Workflow Handlers
            scope.approveTimeOff = function(timeOffId) {
                if (auth.hasRole("manager") || auth.hasRole("owner")) {
                    api.put("timeoff/" + timeOffId + "/approve", {approve: true})
                    .then(function(result) {

                        keenIO.addEvent('timeOffRequestApproval', {
                            user: auth.getUser()._id,
                            bar: auth.getUser().barId,
                            approve: true,
                            timeOff: timeOffId
                        })

                        console.log("Approved");
                        refreshData();
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            };

            scope.declineTimeOff = function(timeOffId) {
                if (auth.hasRole("manager") || auth.hasRole("owner")) {
                    api.put("timeoff/" + timeOffId +"/approve", {approve: false, reason: "Time off request declined, see bar owner."})
                    .then(function(result) {
                        keenIO.addEvent('timeOffRequestApproval', {
                            user: auth.getUser()._id,
                            bar: auth.getUser().barId,
                            approve: false,
                            timeOff: timeOffId
                        })

                        console.log("Declined");
                        refreshData();
                    }).catch(function(err) {
                        console.log(err);
                    });
                }
            };

            scope.approveSwap = function(swapId) {
                api.put("swaps/" + swapId + "/approve", {approve: true})
                .then(function(result) {
                    keenIO.addEvent('shiftSwapApproval', {
                        user: auth.getUser()._id,
                        bar: auth.getUser().barId,
                        approval: true,
                        swap: swapId
                    })

                    console.log("Approved");
                    refreshData();
                }).catch(function(err) {
                    console.log(err);
                });
            };

            scope.declineSwap = function(swapId) {
                api.put("swaps/" + swapId +"/approve", {approve: false, reason: "Swap request declined."})
                .then(function(result) {
                    keenIO.addEvent('shiftSwapApproval', {
                        user: auth.getUser()._id,
                        bar: auth.getUser().barId,
                        approval: false,
                        swap: swapId
                    })

                    console.log("Declined");
                    refreshData();
                }).catch(function(err) {
                    console.log(err);
                });
            };

            //Load latest data from Persistence
            prepareTorData(TIMEOFF);
            prepareSwapData(SWAPS);

            function prepareTorData(tors) {
                var filtered = tors;
                if(!auth.hasRole("manager") && !auth.hasRole("owner")) {
                    filtered = tors.filter(function(x) {
                        if(x.requestor === auth.getUser()._id) {
                            return true;
                        }
                    });
                }

                filtered.map(function(x) {
                    var dateStr = moment(x.startTimeUTC).format("M/D");
                    var startStr = moment(x.startTimeUTC).format("h:mma");
                    var endStr = moment(x.endTimeUTC).format("h:mma");

                    var shiftStr = dateStr + ": " + startStr + " - " + endStr;

                    var torObj = {
                        swapId: x.id,
                        type: "timeOff",
                        requestingUser: {
                            avatar: x.requestor.pictureURI,
                            userName: x.requestor.firstName,
                            hours: false,
                            shiftStr: shiftStr,
                            reason: x.requestReason
                        }
                    }

                    switch(x.approvalStatus) {
                        case 'pending':
                            scope.unfilteredSwaps.pending.push(torObj);
                            break;
                        case 'approved':
                            scope.unfilteredSwaps.approved.push(torObj);
                            break;
                        case 'declined':
                            scope.unfilteredSwaps.declined.push(torObj);
                            break;
                    }
                });
            };

            function prepareSwapData(swaps) {
                console.log(swaps);
                var filtered = [];
                if(auth.hasPermission('schedule', 'approveSwap')) {
                    filtered = swaps.filter(function(x) {
                        if(x.requestor._id === auth.getUser()._id ||
                            x.switchWith._id === auth.getUser()._id ||
                            x.switchWithStatus === "approved") {
                            return true;
                        }
                    });
                } else {
                    filtered = swaps.filter(function(x) {
                        if(x.requestor._id === auth.getUser()._id ||
                            x.switchWith._id === auth.getUser()._id) {
                            return true;
                        }
                    });
                }

                filtered.map(function(x) {
                    var swapObj = {
                        swapId: x._id,
                        type: "swap",
                        updatedOn: moment(x.updated).format("MMMM Do YYYY, h:mm a"),
                        userStatus: x.switchWithStatus,
                        managerStatus: x.approvalStatus,
                        declinedReason: x.declinedReason,
                        requestingUser: {
                            id: x.requestor._id,
                            avatar: x.requestor.pictureURI,
                            userName: x.requestor.firstName,
                            hours: false,
                            shiftStr: getShiftStr(x.originalShift),
                            reason: x.requestReason
                        },
                        requestedUser: {
                            id: x.switchWith._id,
                            avatar: x.switchWith.pictureURI,
                            userName: x.switchWith.firstName,
                            hours: false,
                            shiftStr: getShiftStr(x.requestedShift)
                        }
                    }

                    switch(x.approvalStatus) {
                        case 'pending':
                            scope.unfilteredSwaps.pending.push(swapObj);
                            break;
                        case 'approved':
                            scope.unfilteredSwaps.approved.push(swapObj);
                            break;
                        case 'declined':
                            scope.unfilteredSwaps.declined.push(swapObj);
                            break;
                    }
                });
            };

            function getShiftStr(shift) {
                var dateStr = moment(shift.startTimeUTC).format("M/D");
                var startStr = moment(shift.startTimeUTC).format("h:mma");
                var endStr = moment(shift.endTimeUTC).format("h:mma");
                var shiftStr = dateStr + ": " + startStr + " - " + endStr;

                return shiftStr;
            };

            function refreshData() {
                scope.unfilteredSwaps.pending = [];
                scope.unfilteredSwaps.approved = [];
                scope.unfilteredSwaps.declined = [];
                scope.swaps.pending = [];
                scope.swaps.approved = [];
                scope.swaps.declined = [];

                var swapPromise = api.get("swaps").then(function(result) {
                        return result.data;
                    });

                var torPromise = api.get("timeoff/upcoming").then(function(result) {
                        return result.data;
                    });

                $q.all([swapPromise,torPromise])
                .then(function(res) {
                    prepareSwapData(res[0]);
                    prepareTorData(res[1]);
                    scope.viewAll();
                }).catch(function(err) {
                    console.log(err);
                });
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

            scope.viewAll();
        }
    ]);
