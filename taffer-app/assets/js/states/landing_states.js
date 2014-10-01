angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main", {
			url: "/main",
			abstract: true,
			templateUrl: "views/main/main.html",
			controller: "MainCtrl",
			resolve: {
				BAR: ["api", function(api) {
					return api.get("bar");
				}]
			}
		})

		// Landing Page
		.state("Main.Landing", {
			url: "/home",
			views: {
				"landing": {
					templateUrl: "views/main/landing/landing.html",
					controller: "LandingCtrl"
				}
			},
			resolve: {
				NEXTSHIFTS: ["ShiftService", function(shiftService) {
					return shiftService.getNextShifts().catch(function() {
						return [];
					});
				}],
				SPONSORS: ["SponsorService", function(sponsorService) {
					return sponsorService.get().catch(function() {
						return null;
					});
				}],
				SALESDASH: ["SalesService", function(salesService) {
					return salesService.getDashboardData().catch(function() {
						return null;
					});
				}]
			}
		});
	}
]);
