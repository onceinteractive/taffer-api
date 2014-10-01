angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Schedule", {
			url: "/schedule",
			views : {
				"schedule" : {
					templateUrl: "views/schedule/schedule.html",
					controller: "ScheduleCtrl"
				}
			}
		})

		.state("Main.Schedule.Overview", {
			url: "/schedule-overview?weekStart&weekEnd",
			templateUrl: "views/schedule/schedule_overview.html",
			controller: "ScheduleOverviewCtrl",
			resolve: {
				USERS: ["api", function(api) {
					return api.get("users/all").then(function(result) {
						return result.data;
					}).catch(function(err) {
						return [];
					});
				}]
			},
			onEnter: ["OrientationService", function(orientation) {
				orientation.lockLandscape();
			}],
			onExit: ["OrientationService", function(orientation) {
				orientation.lockPortrait();
			}]
		})

		.state("Main.Schedule.Shift", {
			url: "/schedule-shift?userID&shiftID&shiftStart&shiftEnd&date&isOpening&isClosing&weekStart&weekEnd&timeoffID&timeoffIsAllDay&timeoffStatus",
			templateUrl: "views/schedule/schedule_shift.html",
			controller: "ScheduleShiftCtrl"
		})

		.state("Main.Schedule.Events", {
			url: "/schedule-events",
			templateUrl: "views/schedule/events/events_overview.html",
			controller: "EventsOverviewCtrl"
		})

		.state("Main.Schedule.EventsAdd", {
			url: "/schedule-events/add/:eventId/:editSeries",
			templateUrl: "views/schedule/events/events_add.html",
			controller: "EventsAddCtrl"
		})

		.state("Main.Schedule.ShiftSwap", {
			url: "/shift-swap",
			templateUrl: "views/schedule/shifts/shift_swap.html",
			controller: "ScheduleSwapCtrl",
			resolve: {
				SWAPS: ["api", function(api) {
					return api.get("swaps")
						.then(function(result) {
							return result.data;
						}).catch(function(err) {
							console.log(err);
						});
				}],

				TIMEOFF: ["api", function(api) {
					return api.get("timeoff/upcoming")
						.then(function(result) {
							return result.data;
						}).catch(function(err) {
							return [];
						});
				}],
			}
		})

		.state("Main.Schedule.ShiftSwapNew", {
			url: "/new-shift-swap?requestedUserId&myShift",
			templateUrl: "views/schedule/shifts/new_shift_swap.html",
			controller: "ScheduleNewSwapCtrl"
		})

		.state("Main.Schedule.SelectUser", {
			url: "/select-user?myShift",
			templateUrl: "views/schedule/shifts/select_user.html",
			controller: "ScheduleSelectUserCtrl",
			resolve: {
				SHIFTS: ["ScheduleService", function(schedule) {
					var start = moment().startOf("isoweek");
					var end = start.clone().add(5, "week");

					return schedule.getShifts(start.valueOf(), end.valueOf())
						.then(function(result) {
							return result.data;
						}).catch(function(err) {
							return [];
						});
				}]
			}
		})

		.state("Main.Schedule.TimeOff", {
			url: "/time-off",
			templateUrl: "views/schedule/shifts/time_off.html",
			controller: "ScheduleTimeOffCtrl"
		});
	}
]);
