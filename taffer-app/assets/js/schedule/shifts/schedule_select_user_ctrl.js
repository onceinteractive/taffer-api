angular.module("taffer.controllers")
    .controller("ScheduleSelectUserCtrl", [
        "$scope",
        "$state",
        "$stateParams",
        "api",
        "$timeout",
        "DataService",
        "$q",
        "SHIFTS",
        "AuthService",
        function(scope, state, stateParams, api, timeout, DataService, $q, SHIFTS, auth) {

            scope.header.subTitle = "Select User";
            scope.header.mainTitle = scope.bar.name;
            scope.header.homeBtn = false;
            scope.header.addBtn = false;
            scope.header.cancelBtn = false;
            scope.header.saveBtn = false;
            scope.header.backBtn = true;
            scope.header.footerNav = false;
            scope.users = [];

            //Event Handlers
            scope.$on("parent-back", function(event) {
                state.go("Main.Schedule.ShiftSwapNew");
            });

            scope.selectUser = function(user) {
                state.go("Main.Schedule.ShiftSwapNew",{
                    requestedUserId: user._id,
                    myShift: stateParams.myShift
                });
            };

            function loadUsers() {
                var added = {};
                var filtered = SHIFTS.filter(function(x) {
                    if(x.user._id !== auth.getUser()._id) {
                        return true;
                    }
                });

                filtered.map(function(x) {
                    if(!added[x.user._id]) {
                        scope.users.push(x.user);
                        added[x.user._id] = true;
                    }
                });
            };

            loadUsers();
        }
    ]);
