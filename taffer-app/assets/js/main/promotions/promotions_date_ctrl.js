angular.module("taffer.controllers")
.controller("PromotionsDateCtrl", [
	"$scope",
	"$state",
	"$stateParams",
	"$ocModal",
	function(scope, state, params, modal) {
		scope.isEditing = false;

		if(params && params.isEditing && params.isEditing === 'true') {
			scope.isEditing = true;
		}

		if(scope.isEditing) {
			scope.$on("parent-back", function() {
				state.go("Main.Promotions.Edit");
			});
		} else {
			scope.$on("parent-back", function() {
				state.go("Main.Promotions.New");
			});
		}

		if(scope.workingPromotion && scope.workingPromotion.startDate && scope.workingPromotion.startDate !== "") {
			scope.selectedDate = moment(scope.workingPromotion.startDate).format("YYYY-MM-DD");
			scope.startTime = moment(scope.workingPromotion.startDate).format("HH:mm");
		} else {
			scope.selectedDate = moment().format("YYYY-MM-DD");
		}

		if(scope.workingPromotion && scope.workingPromotion.endDate && scope.workingPromotion.endDate !== "") {
			scope.endTime = moment(scope.workingPromotion.endDate).format("HH:mm");
		}

		scope.cancel = function() {
			if(scope.isEditing) {
				state.go("Main.Promotions.Edit");
			} else {
				state.go("Main.Promotions.New");
			}
		};

		scope.finish = function() {
			modal.close();
			startDate = moment(scope.selectedDate);
			splitStartTime = scope.startTime.split(":");

			startDate.hour(splitStartTime[0]);
			startDate.minute(splitStartTime[1]);

			scope.workingPromotion.startDate = startDate.toDate();

			if(startDate.isAfter(scope.workingPromotion.endDate) || !scope.isEditing) {
				endDate = moment(scope.selectedDate);
				splitEndTime = scope.endTime.split(":");

				endDate.hour(splitEndTime[0]);
				endDate.minute(splitEndTime[1]);

				scope.workingPromotion.endDate = endDate.toDate();
				scope.workingPromotion.occurences = [];
			}

			if(scope.isEditing) {
				state.go("Main.Promotions.Edit");
			} else {
				state.go("Main.Promotions.New");
			}
		};

		scope.save = function() {
			if(scope.promoDateForm.$valid && scope.selectedDate) {
				startDate = moment(scope.selectedDate);

				if(startDate.isAfter(scope.workingPromotion.endDate) && scope.isEditing) {
					modal.open({
							url: "views/modals/confirmation_modal.html",
							cls: "fade-in",
							init: {
								message: "The start date you've selected occurs after the end date of your promotion window. If you continue with those change, you will be required to reset your window. Are you sure?",
								onConfirmed: scope.finish
							}
						});
				} else {
					scope.finish();
				}
			}
		};

	}
]);
