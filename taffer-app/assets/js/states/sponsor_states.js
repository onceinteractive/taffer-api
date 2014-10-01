angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Sponsor", {
			url: "/sponsoredcontent?sponsorId",
			views: {
				"sponsor": {
					templateUrl: "views/main/sponsor/sponsor.html",
					controller: "SponsorCtrl"
				}
			}
		});
	}
]);
