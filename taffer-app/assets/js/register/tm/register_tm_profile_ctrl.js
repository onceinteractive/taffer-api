angular.module("taffer.controllers")
.controller("RegisterTMProfileCtrl", [
	"$scope",
	"$state",
	"$stateParams",
	"api",
	"SocialService",
	"AuthService",
	function(scope, state, params, api, social, auth) {
		// Are we resuming an incomplete registration?
		if(params.resuming) {
			scope.retrieveUser();
			scope.retrieveBar();
		}

		scope.$emit("showBack");

		// Handle back and finish clicks
		scope.$on("reg-finish", function(event) {
			if(scope.user.role != "" && scope.user.role != "admin" && scope.user.role != "owner" && scope.user.role != "manager") {
				updateUser();
				var promise = api.post("register/complete", scope.user);
				promise.success(function(data, status, headers, config) {
					if(status == 200) {
						auth.setUser(data);
						state.go("NeedApproval");
					}
				});

				promise.error(function(data, status, headers, config) {
					console.log(data);
					console.log(status);
				});
			}
		});

		scope.$on("reg-back", function(event) {
			state.go("Registration.BarID");
		});

		scope.roles = [
			"manager",
			"assistant manager",
			"bartender",
			"waiter/waitress",
			"host/hostess",
			"bar-back",
			"cook"
		];

		// Helper functions
		function updateUser() {
			var promise = api.post("register/user", scope.user);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentUser(data);
					state.go("Main.Landing");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
			});

		};

		scope.imageSuccess = function(result) {
			var data = {image: result.uri};

			var promise = api.post("register/image", data);
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
			social.linkFacebookUser(function(data) {
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
			social.linkTwitterUser(function(data) {
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
	}
]);
