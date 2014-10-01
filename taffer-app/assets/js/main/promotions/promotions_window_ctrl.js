angular.module("taffer.controllers")
.controller("PromotionsWindowCtrl", [
	"$scope",
	"$state",
	"$ocModal",
	"Dates",
	function(scope, state, modal, datesService) {
		// Base Dates to Clone From
		var baseStart = moment(scope.workingPromotion.startDate);
		var baseEnd = moment(scope.workingPromotion.endDate);

		// Prefill startDate if picked already
		var preFill = baseStart.clone();
		scope.selectedDates = [preFill.format("YYYY-MM-DD")];

		// Days for week day select
		scope.weekdays = [
			"Mon",
			"Tues",
			"Wed",
			"Thur",
			"Fri",
			"Sat",
			"Sun"
		];

		scope.selectedDays = {
			Mon: false,
			Tues: false,
			Wed: false,
			Thur: false,
			Fri: false,
			Sat: false,
			Sun: false
		};

		scope.cancel = function() {
			state.go("Main.Promotions.New");
		};

		scope.save = function() {
			if(scope.promoWindowForm.$valid &&
				scope.selectedDates.length === 2 &&
				(scope.selectedDays.Mon ||
					scope.selectedDays.Tues ||
					scope.selectedDays.Wed ||
					scope.selectedDays.Thur ||
					scope.selectedDays.Fri ||
					scope.selectedDays.Sat ||
					scope.selectedDays.Sun)) {
						// Change End Date
						var tempEDate = moment(scope.selectedDates[1]);
						var tempEDate2 = baseEnd.clone();

						tempEDate2.year(tempEDate.year());
						tempEDate2.month(tempEDate.month());
						tempEDate2.date(tempEDate.date());

						scope.workingPromotion.endDate = tempEDate2.toDate();

						// Change Start Date
						var tempSDate = moment(scope.selectedDates[0]);
						var tempSDate2 = baseStart.clone();

						tempSDate2.year(tempSDate.year());
						tempSDate2.month(tempSDate.month());
						tempSDate2.date(tempSDate.date());

						scope.workingPromotion.startDate = tempSDate2.toDate();

						// Log them both
						console.log(scope.workingPromotion.startDate);
						console.log(scope.workingPromotion.endDate);

						console.log(scope.selectedDay);

						var occurs = getOccurs();

						scope.workingPromotion.occurences = occurs;
						scope.updateParentPromotion(scope.workingPromotion);

						state.go("Main.Promotions.New");
				} else {
					modal.open({
						url: "views/modals/error_message.html",
						cls: "fade-in",
						init: {
							errorMessage: "Please select a range of dates for the promotional window."
						}
					})
				}
		};

		function getOccurs() {
			var occurs = [];
			if(scope.selectedDays.Mon){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					1
				));
			}
			if(scope.selectedDays.Tues){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					2
				));
			}
			if(scope.selectedDays.Wed){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					3
				));
			}
			if(scope.selectedDays.Thur){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					4
				));
			}
			if(scope.selectedDays.Fri){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					5
				));
			}
			if(scope.selectedDays.Sat){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					6
				));
			}
			if(scope.selectedDays.Sun){
				occurs = occurs.concat(datesService.findDayOccurBetween(
					scope.workingPromotion.startDate,
					scope.workingPromotion.endDate,
					0
				));
			}
			return occurs;
		};
	}
]);
