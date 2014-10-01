angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Profile", {
			url: "/profile",
			views: {
				"profile": {
					templateUrl: "views/main/profile/profile.html",
					controller: "ProfileCtrl",
					resolve : {
						USER: ["api", function(api) {
							return api.get("users");
						}],
						BARTYPES: ["api", function(api) {
							return api.get("bar/types");
						}]
					}
				}
			}
		});

		stateProvider.state("Main.Profile.Survey", {
			url: "/survey",
			views: {
				"profile@Main": {
					templateUrl: "views/main/profile/survey.html",
					controller: "ProfileSurveyCtrl",
					resolve: {
						questions: ["api", function(api) {
							return api.get("surveys");
						}]
					}
				}
			}
		})
	}
]);
