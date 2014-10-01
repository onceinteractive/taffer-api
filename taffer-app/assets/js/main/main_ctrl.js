angular.module("taffer.controllers")
.controller("MainCtrl", [
	"$scope",
	"$rootScope",
	"$state",
	"api",
	"BAR",
	"AuthService",
	function(scope, rootScope, state, api, BAR, auth) {
		scope.isLogin = false;
		scope.bar = BAR.data;

		scope.showDoneButton = false;
		scope.showEditButton = true;

		scope.updateUserInfo = function(user) {
			auth.setUser(user);
		}

		scope.updateBarInfo = function(bar) {
			scope.bar = bar;
		}

        /**
         * Configure this header object in a sub controller to alter the header.
         * There may logic in sub controllers which determine the status of the header,
         * so we like to keep that header logic in those controllers instead of duplicating it here.
         * @type {{mainTitle: *, subTitle: null, homeIcon: boolean, addIcon: boolean, cancelBtn: boolean, saveBtn: boolean, backBtn: boolean}}
         */
        scope.header = {
            subTitle  : null,
            homeBtn   : false,
            addBtn    : false,
            cancelBtn : false,
            saveBtn   : false,
            backBtn   : false
        };

		scope.shouldShowNotificationsButton = function() {
			var name = state.current.name;
			if(name == "Main.Landing") {
				return true;
			}
			return false;
		};

		scope.shouldShowHelpButton = function() {
			var name = state.current.name;
			if(name == "Main.Sales.View") {
				return true;
			}
		};

		scope.shouldShowHomeButton = function() {
			var name = state.current.name;
			if(name == "Main.LogBook.List" ||
			name == "Main.TafferTips" ||
			name == "Main.Questions" ||
			name == "Main.Promotions.Scheduled" ||
			name == "Main.Messages.List" ||
			name == "Main.MyTeam.List" ||
			name == "Main.Notifications" ||
			name == "Main.Sales.View" ||
			name == "Main.Courses.List" ||
			name == "Main.Legal.FAQ" ||
			name == "Main.Legal.TermsOfUse" ||
			name == "Main.Legal.PrivacyPolicy" ||
			name == "Main.Preshift.List") {
				return true;
			}

            //states which implement the header object
            if (scope.header.homeBtn &&
                (name == "Main.Schedule.Overview" ||
                name == "Main.Schedule.Shift" ||
                name == "Main.Schedule.Events" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.EventsAdd" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.ShiftSwapNew" ||
                name == "Main.Schedule.SelectUser" ||
                name == "Main.Schedule.TimeOff")
                ) {
                return true;
            }
			return false;
		};

		scope.shouldShowBackButton = function() {
			var name = state.current.name;
			if(name == "Main.LogBook.View" ||
			name == "Main.Questions.View" ||
			name == "Main.Questions.View" ||
			name == "Main.Promotions.Edit" ||
			name == "Main.Promotions.List" ||
			name == "Main.Promotions.New" ||
			name == "Main.Promotions.Date" ||
			name == "Main.Messages.ViewSuggestion" ||
			name == "Main.Promotions.Social" ||
			name == "Main.Courses.Details" ||
			name == "Main.Preshift.View") {
				return true;
			}
            //states which implement the header object
            if (scope.header.backBtn &&
                (name == "Main.Schedule.Overview" ||
                name == "Main.Schedule.Shift" ||
                name == "Main.Schedule.Events" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.EventsAdd" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.ShiftSwapNew" ||
                name == "Main.Schedule.SelectUser" ||
                name == "Main.Schedule.TimeOff")
                ) {
                return true;
            }
			return false;
		};

		scope.shouldShowCreateButton = function() {
			var name = state.current.name;
			if((name == "Main.LogBook.List" && auth.hasPermission('logbooks', 'write'))||
			name == "Main.Questions" ||
			(name == "Main.MyTeam.List" && auth.hasPermission('invite', 'send'))||
			(name == "Main.Preshift.List" && auth.hasPermission('preshift', 'send')) ||
			(name == "Main.Schedule.Events" && auth.hasPermission('schedule', 'scheduleEvents'))) {
				return true;
			}
            //states which implement the header object
            if (scope.header.addBtn &&
                (name == "Main.Schedule.Overview" ||
                name == "Main.Schedule.Shift" ||
                name == "Main.Schedule.Events" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.EventsAdd" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.ShiftSwapNew" ||
                name == "Main.Schedule.SelectUser" ||
                name == "Main.Schedule.TimeOff")
                ) {
                return true;
            }
			return false;
		};

        scope.shouldShowSaveButton = function() {
            var name = state.current.name;
            //states which implement the header object
            if (scope.header.saveBtn &&
                (name == "Main.Schedule.Overview" ||
                name == "Main.Schedule.Shift" ||
                name == "Main.Schedule.Events" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.EventsAdd" ||
                name == "Main.Schedule.ShiftSwap" ||
                name == "Main.Schedule.ShiftSwapNew" ||
                name == "Main.Schedule.SelectUser" ||
                name == "Main.Schedule.TimeOff")
                ) {
                return true;
            }
            return false;
        }

		scope.shouldShowEditButton = function() {
			var name = state.current.name;
			if(name == "Main.Messages.List" ||
			name == "Main.Notifications") {
				return true;
			}
			return false;
		};

		scope.shouldShowSkipButton = function() {
			var name = state.current.name;
			if(name == "Main.Promotions.Social") {
				return true;
			}
			return false;
		}

		scope.go = function(path) {
			state.go(path);
		};

		scope.goHome = function() {
			scope.showDoneButton = false;
			scope.showEditButton = false;
			state.go("Main.Landing");
		};

		scope.back = function() {
			scope.$broadcast("parent-back");
		}

		scope.create = function() {
			scope.$broadcast("parent-create");
		}

        scope.save = function() {
            scope.$broadcast("parent-save");
        }

		scope.edit = function() {
			scope.$broadcast("parent-edit");
		}

		scope.done = function() {
			scope.$broadcast("parent-done");
		}

		scope.skip = function() {
			scope.$broadcast("parent-skip");
		}

		scope.$on("child-show-done", function() {
			scope.showDoneButton = true;
		});

		scope.$on("child-hide-done", function() {
			scope.showDoneButton = false;
		});

		scope.$on("child-hide-edit", function() {
			scope.showEditButton = false;
		});

		scope.$on("child-show-edit", function() {
			scope.showEditButton = true;
		});
	}
]);
