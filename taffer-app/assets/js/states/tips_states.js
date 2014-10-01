angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.TafferTips", {
			url: "/taffertips?tipId",
			views: {
				"taffertips": {
					templateUrl: "views/main/taffertips/taffer_tips.html",
					controller: "TafferTipsCtrl",
					resolve: {
						TIPS: ["TipService", function(tipService) {
							return tipService.getAll().catch(function() {
								return [];
							});
						}]
					}
				}
			},
			onEnter: function() {
				(function() {
		      window.scrollTo(0,0);
		    })();
			}
		});
	}
]);
