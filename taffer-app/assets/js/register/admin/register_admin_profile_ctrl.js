angular.module("taffer.controllers")
.controller("RegisterAdminProfileCtrl", [
	"$scope",
	"$state",
	"$stateParams",
	"$ocModal",
	"api",
	"cordovaService",
	"SocialService",
	"AuthService",
	function(scope, state, params, modal, api, cordovaService, social, auth) {
		// Are we resuming an incomplete registration?
		if(params.resuming){
			scope.retrieveUser();
			scope.retrieveBar();
		}

		// Handle back and finish clicks
		scope.$on("reg-finish", function(event) {
			var promise = api.post("register/user", scope.user);
			promise.success(function(data, status, headers, config) {
				data.status = 'active'
				auth.setUser(data);

				var completeUserPromise = api.post('register/complete', {})
				completeUserPromise.success(function(data, status, headers, config){
					console.log(data)
					modal.open({
						url: "views/modals/complete_profile_modal.html",
						controller: "ThanksVideoCtrl",
						cls: "fade-in",
						onClose: getStarted
					});
				})

				completeUserPromise.error(function(data, status, headers, config){
					console.log(data)
					console.log(status)
				})

				
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		});

		scope.$on("reg-back", function(event) {
			state.go("Registration.BarQuestions");
		});

		scope.imageSuccess = function(result) {
			var postData = {image: result.uri}

			var promise = api.post("register/image", postData);
			promise.success(function (data, status, headers, config) {
				scope.updateParentUser(data);
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
			});
		};

		scope.profilePicture = function() {
			if(scope.user.pictureURI) {
				return "https://s3.amazonaws.com/taffer-dev/" + scope.user.pictureURI;
			} else {
				return "";
			}
		};

		scope.linkFacebook = function() {
			social.linkFacebookBar(function(data) {
				modal.open({
					url: "views/modals/feedback_message.html",
					init: {
						feedbackMessage: "Facebook Account Successfully Linked"
					},
					cls: "fade-in"
				});

				scope.fbSuccess = true;
				scope.fbError = false;
			}, function(err) {
				scope.fbError = true;
				console.log(err);
			});
		};

		scope.linkTwitter = function() {
			social.linkTwitterBar(function(data) {
				modal.open({
					url: "views/modals/feedback_message.html",
					init: {
						feedbackMessage: "Twitter Account Successfully Linked"
					},
					cls: "fade-in"
				});

				scope.twitterSuccess = true;
				scope.twitterError = false;
			}, function(err) {
				scope.twitterError = true;
				console.log(err);
			});
		};

		function getStarted() {
			state.go("Main.Landing");
		};
	}
]);
