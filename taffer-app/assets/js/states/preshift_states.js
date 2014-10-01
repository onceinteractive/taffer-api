angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Preshift", {
			abstract: true,
			url: "/preshift",
			views: {
				"preshift": {
					template: '<div id="l-preshift-view" class="view" ui-view></div>',
					controller: "PreshiftCtrl",
					resolve: {
						PRESHIFTMSGS: ["api", function(api) {
							return api.get("preshift");
						}],
						RECIPIENTS: ["api", function(api) {
							return api.get("users/all");
						}]
					}
				}
			}
		})

		.state("Main.Preshift.List", {
			url: "/preshiftlist",
			templateUrl: "views/main/preshift/preshift_list.html",
			controller: "PreshiftListCtrl"
		})

		.state("Main.Preshift.New", {
			url: "/preshiftnew",
			templateUrl: "views/main/preshift/preshift_new.html",
			controller: "PreshiftNewCtrl"
		})

		.state("Main.Preshift.Recipients", {
			url: "/preshiftrecipients",
			templateUrl: "views/main/preshift/preshift_recipients.html",
			controller: "PreshiftRecipientsCtrl"
		})

		.state("Main.Preshift.View", {
			url: "/preshiftview",
			templateUrl: "views/main/preshift/preshift_view.html",
			controller: "PreshiftViewCtrl"
		});
	}
]);
