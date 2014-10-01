angular.module("taffer.controllers")
.controller("LandingCtrl", [
	"$scope",
	"$state",
	"$ocModal",
	"api",
	"d3Service",
	"cordovaService",
	"DataService",
	"IntervalService",
	"spinner",
	"Dates",
	"promiseCache",
	"NEXTSHIFTS",
	"SPONSORS",
	"SALESDASH",
	"AuthService",
	function(scope, state, modal, api, d3s, cordovaService, intervalService, dataService, spinner, dates, promiseCache, NEXTSHIFTS, SPONSORS, SALESDASH, auth) {
		scope.auth = auth;
		
		scope.showBadges = false;
		scope.badgeArrow = "down-arrow";
		scope.nextShifts = [];
		scope.sponsors = SPONSORS;

		scope.auth = auth;

		(function(nextShiftsList) {
			if($(window).width() < 600) { // it's a phone, only show 1 upcoming schedule
				if(nextShiftsList.length > 0) {
					scope.nextShifts.push(nextShiftsList[0]);
				}
			} else {
				scope.nextShifts = nextShiftsList;
			}

			if(scope.nextShifts && scope.nextShifts.length > 0) {
				scope.nextShifts.forEach(function(shift) {
					shift.startTime = new Date(shift.startTimeUTC);
					shift.endTime = new Date(shift.endTimeUTC);
				});
			}
		})(NEXTSHIFTS);

		scope.salesDash = SALESDASH;

		scope.getNextScheduledDay = function(shift) {
			return dates.findDay(shift.startTime.getTime());
		}

		scope.toggleBadges = function(){
			if(!scope.showBadges) {
				scope.showBadges = true;
				scope.badgeArrow = "down-arrow-active";
			} else {
				scope.showBadges = false;
				scope.badgeArrow = "down-arrow";
			}
		};

		scope.logout = function() {
			// Remove cached promise results from local storage
			auth.logout();
		};

		scope.showPartender = function() {
			modal.open({
				id: 'partenderModal',
				url: "views/modals/partender_modal.html",
				controller: "PartenderVideoCtrl",
				cls: "fade-in"
			});
		};

		scope.shouldShowPartender = function() {
			return !cordovaService.device.isAndroid() && auth.hasPermission('partender', 'view');
		};

		scope.salesAvgWeekly = function() {
			var bin = d3s.createBin(scope.salesDash.allSales, d3.time.week, 1);
			var sum = d3.sum(bin, function(x) { return x.values; });

			return sum / bin.length;
		};

		scope.viewSponsor = function(sponsor) {
			console.log("SPONSOR ID", sponsor);
			if(sponsor._id) {
				state.go("Main.Sponsor", {sponsorId: sponsor._id});
			} else {
				state.go("Main.Sponsor");
			}
		};

	}
]);
