angular.module("taffer.controllers")
.controller("PromotionsRecurCtrl", [
	"$scope",
	"$init",
	"$ocModal",
	"SocialService",
	"cordovaService",
	"Dates",
	function(scope, init, modal, social, cs, datesService) {
		scope.hasFacebook = init.hasFacebook;
		scope.hasTwitter = init.hasTwitter;
		scope.buttonText = "Add Post";
		scope.selectedDays = {
			Mon: false,
			Tues: false,
			Wed: false,
			Thur: false,
			Fri: false,
			Sat: false,
			Sun: false
		};
		scope.facebook = false;
		scope.twitter = false;
		scope.time = "";

		if(init.shareable) {
			var m = moment(init.shareable.postOn[0].postTime);
			scope.buttonText = "Update Post";
			scope.facebook = (init.shareable.postOn[0].network.indexOf("facebook") != -1);
			scope.twitter = (init.shareable.postOn[0].network.indexOf("twitter") != -1);
			scope.time = m.format("HH:mm");
			init.shareable.postOn.map(function(x) {
				var m = moment(x.postTime);
				switch(m.day()) {
					case 0:
						scope.selectedDays.Sun = true;
						break;
					case 1:
						scope.selectedDays.Mon = true;
						break;
					case 2:
						scope.selectedDays.Tues = true;
						break;
					case 3:
						scope.selectedDays.Wed = true;
						break;
					case 4:
						scope.selectedDays.Thur = true;
						break;
					case 5:
						scope.selectedDays.Fri = true;
						break;
					case 6:
						scope.selectedDays.Sat = true;
						break;
				}
			});
		}

		scope.weekdays = [
			"Mon",
			"Tues",
			"Wed",
			"Thur",
			"Fri",
			"Sat",
			"Sun"
		];

		scope.addPost = function() {
			if(!scope.facebook && !scope.twitter) {
				alert("Please select a network");
			} else if(scope.facebook && init.facebookMessage.length == 0){
				alert("You can not select Facebook as a network without text in the Facebook message.")
			} else if(scope.twitter && init.twitterMessage.length == 0){
				alert("You can not select Twitter as a network without text in the Twitter message.")
			} else {
				schedule();
			}
		};

		function schedule() {
			var posts = [];
			var networks = [];
			if(scope.facebook) {
				networks.push("facebook");
			}
			if(scope.twitter) {
				networks.push("twitter");
			}
			var postDates = getDates();
			var splitTime = scope.time.split(":");

			postDates = postDates.map(function(date) {
				var m = moment(date);
				m.hour(splitTime[0]);
				m.minute(splitTime[1]);
				return m.toDate();
			});

			for(var date in postDates) {
				var post = {
					network: networks,
					postTime: postDates[0]
				};

				posts.push(post);
			}

			if(init.shareable) {
				init.editPostsRecur(posts, init.shareIndex);
			} else {
				init.updatePostsRecur(posts);
			}

			modal.close();
		};

		function getDates() {
			var dates = [];
			for(var day in scope.selectedDays) {
				if(scope.selectedDays[day]) {
					switch(day) {
						case "Mon":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									1
								)
							);
							break;
						case "Tues":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									2
								)
							);
							break;
						case "Wed":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									3
								)
							);
							break;
						case "Thur":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									4
								)
							);
							break;
						case "Fri":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									5
								)
							);
							break;
						case "Sat":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									6
								)
							);
							break;
						case "Sun":
							dates = dates.concat(
								datesService.findDayOccurBetween(
									init.promo.startDate,
									init.promo.endDate,
									0
								)
							);
							break;
					}
				}
			}
			return dates;
		};

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
									feedbackMessage: "Facebook Successfully Linked"
								}
							});
						},
						function() {
							scope.hasFacebook = false;
							modal.open({
								url: "views/modals/error_message.html",
								cls: "fade-in",
								init: {
									errorMessage: "Error Linking Facebook"
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
									feedbackMessage: "Twitter Successfully Linked"
								}
							});
						},
						function() {
							scope.hasTwitter = false;
							modal.open({
								url: "views/modals/error_message.html",
								cls: "fade-in",
								init: {
									errorMessage: "Error Linking Twitter"
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
