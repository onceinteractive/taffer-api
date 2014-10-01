angular.module("taffer.controllers")
.controller("PromotionsSocialCtrl", [
	"$scope",
	"$state",
	"$ocModal",
	"api",
	"AuthService",
	function(scope, state, modal, api, auth) {
		scope.workingPromotion.sharables = [];
		scope.selectedImage = "";
		scope.facebookMessage = "";
		scope.twitterMessage = "";
		scope.tempimage

		if(auth.getUser().twitter || (scope.bar.twitter && auth.hasPermission('social', 'manage'))) {
			scope.hasTwitter = true;
		} else {
			scope.hasTwitter = false;
		}

		if(auth.getUser().facebook || (scope.bar.facebook && auth.hasPermission('social', 'manage'))) {
			scope.hasFacebook = true;
		} else {
			scope.hasFacebook = false;
		}

		scope.updatePostsOnce = function(post) {
			var sharable = {
				selectedImage: scope.selectedImage,
				facebookMessage: scope.facebookMessage,
				twitterMessage: scope.twitterMessage,
				postOn: [
					post
				]
			}

			scope.workingPromotion.sharables.push(sharable);
		};

		scope.updatePostsRecur = function(posts) {
			var sharable = {
				selectedImage: scope.selectedImage,
				facebookMessage: scope.facebookMessage,
				twitterMessage: scope.twitterMessage,
				postOn: posts
			}

			scope.workingPromotion.sharables.push(sharable);
		};

		scope.editPostsOnce = function(post, index) {
			scope.workingPromotion.sharables[index].postOn = [post];
		};

		scope.editPostsRecur = function(posts, index) {
			scope.workingPromotion.sharables[index].postOn = posts;
		};

		var modalParams = {
			updatePostsOnce: scope.updatePostsOnce,
			updatePostsRecur: scope.updatePostsRecur,
			editPostsOnce: scope.editPostsOnce,
			editPostsRecur: scope.editPostsRecur,
			promo: scope.workingPromotion,
			hasFacebook: scope.hasFacebook,
			hasTwitter: scope.hasTwitter
		};

		scope.getImageURI = function(path) {
			if(path) {
				return path;
			}
			return "";
		};

		scope.select = function(index) {
			if(scope.workingPromotion.socialImages &&
				scope.workingPromotion.socialImages[index]) {
					if(scope.selectedImage == scope.workingPromotion.socialImages[index]){
						scope.selectedImage = "";
					} else {
						scope.selectedImage = scope.workingPromotion.socialImages[index];
					}
				}
		};

		scope.isSelected = function(index) {
			if(scope.selectedImage == 'UPLOAD'){
				return false
			} else if(scope.workingPromotion.socialImages &&
				scope.workingPromotion.socialImages[index]) {
					return scope.workingPromotion.socialImages[index] === scope.selectedImage;
				} else {
					return false
				}
		};

		scope.schedulePost = function() {
			if( (scope.facebookMessage.length == 0
				&& scope.twitterMessage.length == 0) ){
				modal.open({
					url: "views/modals/error_message.html",
					cls: "fade-in",
					init: {
						errorMessage: 'You must enter text for at least one social network.'
					}
				});
			} else {
				modalParams.facebookMessage = scope.facebookMessage
				modalParams.twitterMessage = scope.twitterMessage

				if(scope.workingPromotion.occurences &&
					scope.workingPromotion.occurences.length > 0) {
						modal.open({
							url: "views/modals/promotions_social_recurring_modal.html",
							controller: "PromotionsRecurCtrl",
							init: modalParams,
							cls: "fade-in",
							onClose: closeRecurring
						});
					} else {
						modal.open({
							url: "views/modals/promotions_social_once_modal.html",
							controller: "PromotionsOnceCtrl",
							init: modalParams,
							cls: "fade-in",
							onClose: closeOnce
						});
					}
			}
		};

		scope.imageSuccess = function(data){
			scope.selectedImage = 'UPLOAD'
			scope.tempimage = data.uri
		}

		scope.$on("parent-back", function() {
			state.go("Main.Promotions.New");
		});

		scope.$on("parent-skip", function() {
			var workPromo = scope.workingPromotion;
			var promo = {};
			var data = {};
			if(workPromo._id) {
				promo.promotionId = workPromo._id;
			}
			promo.startDate = workPromo.startDate;
			promo.endDate = workPromo.endDate;
			promo.title = workPromo.title;
			promo.description = workPromo.description;
			promo.occurences = workPromo.occurences;

			data.promotion = promo;
			data.sharables = [];

			var promise = api.post("promotions", data);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					state.go("Main.Promotions.Scheduled");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		});

		scope.save = function() {
			var workPromo = scope.workingPromotion;
			var promo = {};
			var data = {};
			if(workPromo._id) {
				promo.promotionId = workPromo._id;
			}
			promo.startDate = workPromo.startDate;
			promo.endDate = workPromo.endDate;
			promo.title = workPromo.title;
			promo.description = workPromo.description;
			promo.occurences = workPromo.occurences;

			data.promotion = promo;
			data.shareables = workPromo.sharables;

			if(scope.tempimage){
				data.image = scope.tempimage
			}

			console.log(data);

			var promise = api.post("promotions", data);
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					state.go("Main.Promotions.Scheduled");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

		scope.getTime = function() {
			console.log(scope.workingPromotion.sharables);
		};

		scope.delete = function(index) {
			scope.workingPromotion.sharables.splice(index,index + 1);
		};

		scope.edit = function(index) {
			var params = modalParams;
			params.shareable = scope.workingPromotion.sharables[index];
			params.shareIndex = index;
			if(scope.workingPromotion.occurences &&
				scope.workingPromotion.occurences.length > 0) {
					modal.open({
						url: "views/modals/promotions_social_recurring_modal.html",
						controller: "PromotionsRecurCtrl",
						init: params,
						cls: "fade-in",
						onClose: closeRecurring
					});
				} else {
					modal.open({
						url: "views/modals/promotions_social_once_modal.html",
						controller: "PromotionsOnceCtrl",
						init: params,
						cls: "fade-in",
						onClose: closeOnce
					});
				}
		};

		scope.onFacebook = function(post) {
			return (post[0].network.indexOf("facebook") >= 0);
		};

		scope.onTwitter = function(post) {
			return (post[0].network.indexOf("twitter") >= 0);
		};

		// Helper Functions
		function closeRecurring() {
			console.log("closed");
		};

		function closeOnce() {
			console.log("closed");
		};
	}
]);
