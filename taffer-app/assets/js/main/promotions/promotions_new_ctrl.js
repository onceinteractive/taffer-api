angular.module("taffer.controllers")
.controller("PromotionsNewCtrl", [
	"$scope",
	"$state",
	"api",
	function(scope, state, api) {
		scope.$on("parent-back", function() {
			state.go("Main.Promotions.Scheduled");
		});

		scope.schedulePromotion = function() {
			state.go("Main.Promotions.Social");
			return;
			// if(auth.getUser().twitter || auth.getUser().facebook) {
			// 	state.go("Main.Promotions.Social");
			// } else {
			// 	var workPromo = scope.workingPromotion;
			// 	var promo = {};
			// 	var data = {};
			// 	if(workPromo._id) {
			// 		promo.promotionId = workPromo._id;
			// 	}
			// 	promo.startDate = workPromo.startDate;
			// 	promo.endDate = workPromo.endDate;
			// 	promo.title = workPromo.title;
			// 	promo.description = workPromo.description;
			// 	promo.occurences = workPromo.occurences;
			//
			// 	data.promotion = promo;
			// 	data.sharables = [];
			//
			// 	var promise = api.post("promotions", data);
			// 	promise.success(function(data, status, headers, config) {
			// 		if(status === 200) {
			// 			state.go("Main.Promotions.Scheduled");
			// 		}
			// 	});
			//
			// 	promise.error(function(data, status, headers, config) {
			// 		console.log(data);
			// 		console.log(status);
			// 	});
			// }
		};

		scope.setPromotionDate = function() {
			state.go("Main.Promotions.Date")
		};
	}
]);
