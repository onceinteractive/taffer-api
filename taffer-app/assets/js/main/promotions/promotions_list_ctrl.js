angular.module("taffer.controllers")
.controller("PromotionsListCtrl", [
	"$scope",
	"$state",
	"api",
	"PROMOTIONS",
	function(scope, state, api, PROMOTIONS) {
		var selectedDesc = "";

		scope.presetPromotions = PROMOTIONS.data.filter(function(p) {
			if(!p.custom && !p.sponsored) {
				return true;
			}
			return false;
		});

		scope.customPromotions = PROMOTIONS.data.filter(function(p) {
			return p.custom;
		});

		scope.sponsoredPromotions = PROMOTIONS.data.filter(function(p) {
			return p.sponsored;
		});

		scope.$on("parent-back", function() {
			state.go("Main.Promotions.Scheduled");
		});

		scope.newPromotion = function(id) {
			var promise = api.get("promotions/" + id);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					data.promotion.custom = true;
					scope.updateParentPromotion(data.promotion, true);
					state.go("Main.Promotions.New");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

		scope.newPremadePromotion = function(id) {
			var promise = api.get("promotions/" + id);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					data.promotion.custom = false;
					scope.updateParentPromotion(data.promotion, true);
					state.go("Main.Promotions.New");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

		scope.showDescription = function(id) {
			if(selectedDesc === id) {
				selectedDesc = "";
			} else {
				selectedDesc = id;
			}
			return;
		}

		scope.shouldShowDescription = function(id) {
			return selectedDesc === id ? true : false;
		}
	}
]);
