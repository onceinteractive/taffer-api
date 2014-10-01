angular.module("taffer.controllers")
.controller("PromotionsCtrl", [
	"$scope",
	function(scope) {
		scope.days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		];

		scope.updateParentPromotion = function(promo, isNewPromotion) {
			scope.workingPromotion = promo;
			if(isNewPromotion) {
				scope.workingPromotion.startDate = "";
				scope.workingPromotion.endDate = "";
			}
		};

		scope.getDays = function() {
			console.log("Getting days");
			if(scope.workingPromotion.occurences &&
				scope.workingPromotion.occurences.length > 0) {
				var days = "";
				var used = [];

				scope.workingPromotion.occurences.map(function(x) {
					var m = moment(x);
					var dayFormat = m.format("dddd") + "s";

					if(used.indexOf(dayFormat) == -1) {
						used.push(dayFormat);
						if(days != "") {
							days += ", ";
						}
						days += dayFormat;
					}
				});

				return days;
			}
			return "";
		};
	}
]);
