angular.module("taffer.controllers")
.controller("PromotionsEditCtrl", [
	"$scope",
	"api",
	"$state",
	function(scope, api, state) {
		scope.$on("parent-back", function() {
			state.go("Main.Promotions.Scheduled");
		});

		scope.editDate = function() {
			state.go("Main.Promotions.Date", {isEditing: true});
		};

		scope.updatePromotion = function() {
			var data = {
				_id: scope.workingPromotion._id,
				barId: scope.workingPromotion.barId,
				description: scope.workingPromotion.description,
				title: scope.workingPromotion.title,
				startDate: new Date(scope.workingPromotion.startDate),
				endDate: new Date(scope.workingPromotion.endDate),
				update: new Date()
			}

			var promise = api.put("promotions/scheduled/" + data._id, data);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					state.go("Main.Promotions.Scheduled");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		}
	}
]);
