angular.module("taffer.controllers")
.controller("PromotionsScheduledCtrl", [
	"$scope",
	"api",
	"$state",
	"SCHEDULED",
	"$ocModal",
	"AuthService",
	function(scope, api, state, SCHEDULED, modal, auth) {
		scope.auth = auth;

		scope.updateParentPromotion({});
		scope.scheduledPromotions = SCHEDULED.data;
		scope.savedPromotions = [];

		scope.deletePromotion = function(id) {
			var promise = api.delete("promotions/scheduled/" + id);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					scope.scheduledPromotions = scope.scheduledPromotions.filter(function(p) {
						return p._id !== id;
					});
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

		scope.editPromotion = function(index) {
			scope.updateParentPromotion(scope.scheduledPromotions[index]);
			state.go("Main.Promotions.Edit");
		};

		scope.getImage = function(promo) {
			if(promo.shareables && promo.shareables.length > 0) {
				var pictureUrl = promo.shareables[0].selectedPicture;
				if(pictureUrl.indexOf('https://') != -1 || pictureUrl.indexOf('http://') != -1){
					return pictureUrl
				} else {
					return 'https://s3.amazonaws.com/taffer-dev/' + pictureUrl
				}
			}
			return "http://placehold.it/150x150";
		};

		scope.teamMemberDetail = function(index) {
			scope.updateParentPromotion(scope.scheduledPromotions[index]);
			state.go("Main.Promotions.TMDetail");
		};

		scope.teamMemberFacebook = function(index) {
			var tempShare = scope.scheduledPromotions[index].shareables[0];
			var message = tempShare.facebookMessage;
			var promise = api.post("facebook/user/share", {message: message, imageUrl: tempShare.selectedPicture});
			promise.success(function(data, status, headers, config) {
				modal.open({
					url: "views/modals/feedback_message.html",
					cls: "fade-in",
					init: {
						feedbackMessage: "Successfully shared to Facebook."
					}
				});
			});

			promise.error(function(data, status, headers, config) {
				modal.open({
					url: "views/modals/feedback_message.html",
					cls: "fade-in",
					init: {
						feedbackMessage: "Please link your Facebook account in the profile section."
					}
				});
			});

		};

		scope.teamMemberTwitter = function(index) {
			var tempShare = scope.scheduledPromotions[index].shareables[0];
			var message = tempShare.twitterMessage;
			var promise = api.post("twitter/user/share", {message: message, imageUrl: tempShare.selectedPicture});
			promise.success(function(data, status, headers, config) {
				console.log(data);
				modal.open({
					url: "views/modals/feedback_message.html",
					cls: "fade-in",
					init: {
						feedbackMessage: "Successfully sent tweet."
					}
				});
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				modal.open({
					url: "views/modals/feedback_message.html",
					cls: "fade-in",
					init: {
						feedbackMessage: "Please link your Twitter account in the profile section."
					}
				});
			});
		}
	}
]);
