angular.module("taffer.controllers")
.controller("PromotionsOnceCtrl", [
	"$scope",
	"$init",
	"$ocModal",
	"AuthService",
	function(scope, init, modal, auth) {
		scope.hasFacebook = init.hasFacebook;
		scope.hasTwitter = init.hasTwitter;
		scope.buttonText = "Add Post";
		scope.selectedDaysBefore = 1;
		scope.facebook = false;
		scope.twitter = false;
		scope.time = "";

		if(init.shareable) {
			var m = moment(init.shareable.postOn[0].postTime);
			scope.buttonText = "Update Post";
			scope.selectedDaysBefore = init.shareable.postOn[0].daysBefore;
			scope.facebook = (init.shareable.postOn[0].network.indexOf("facebook") != -1);
			scope.twitter = (init.shareable.postOn[0].network.indexOf("twitter") != -1);
			scope.time = m.format("HH:mm");
		}

		scope.daysBefore = [
			1,
			2,
			3,
			4,
			5,
			6,
			7
		];

		scope.addPost = function() {
			if(!scope.facebook && !scope.twitter) {
				alert("Please select a network");
			} else if(
				(scope.facebook && init.facebookMessage.length == 0)
				){
				alert("You can not select Facebook as a network without text in the Facebook message.")
			} else if(scope.twitter && init.twitterMessage.length == 0){
				alert("You can not select Twitter as a network without text in the Twitter message.")
			} else {
				schedule();
			}
		};

		function schedule() {
			var networks = [];
			var postDate = getDate();
			if(scope.facebook) {
				networks.push("facebook");
			}
			if(scope.twitter) {
				networks.push("twitter");
			}

			var post = {
				daysBefore: scope.selectedDaysBefore,
				network: networks,
				postTime: postDate
			};

			if(init.shareable) {
				init.editPostsOnce(post, init.shareIndex);
			} else {
				init.updatePostsOnce(post);
			}
			modal.close();
		};

		function getDate() {
			var start = moment(init.promo.startDate);
			postDate = start.clone().startOf("Day");
			postDate.subtract(scope.selectedDaysBefore, "Day");

			var splitTime = scope.time.split(":");
			postDate.hour(splitTime[0]);
			postDate.minute(splitTime[1]);

			return postDate.toDate();
		}

		scope.$watch("facebook", function(newV, oldV) {
			if(!oldV) {
				return;
			}

			if(scope.hasFacebook) {
				return;
			}

			cs.dialogs.confirm(
				"Link Facebook?",
				"You do not have a Facebook account linked, would you like to do that now?",
				function() {
					social.linkFacebookBar(
						function() {
							scope.hasFacebook = true;
							modal.open({
								url: "views/modals/feedback_message.html",
								cls: "fade-in",
								init: {
									feedbackMessage: "Facebook successfully linked."
								}
							});
						},
						function() {
							scope.hasFacebook = false;
							modal.open({
								url: "views/modals/error_message.html",
								cls: "fade-in",
								init: {
									errorMessage: "Error linking Facebook."
								}
							});
						}
					);
				},
				null
			)
		});

		scope.$watch("twitter", function(newV, oldV) {
			if(!oldV) {
				return;
			}

			if(scope.hasTwitter) {
				return;
			}

			cs.dialogs.confirm(
				"Link Twitter?",
				"You do not have a Twitter account linked, would you like to do that now?",
				function() {
					social.linkTwitterBar(
						function() {
							scope.hasTwitter = true;
							modal.open({
								url: "views/modals/feedback_message.html",
								cls: "fade-in",
								init: {
									feedbackMessage: "Twitter successfully linked."
								}
							});
						},
						function() {
							scope.hasTwitter = false;
							modal.open({
								url: "views/modals/error_message.html",
								cls: "fade-in",
								init: {
									errorMessage: "Error linking Twitter."
								}
							});
						}
					);
				},
				null
			);
		});
	}
]);
