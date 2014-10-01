angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Promotions", {
			abstract: true,
			url: "/promotions",
			views: {
				"promotions": {
					templateUrl: "views/main/promotions/promotions.html",
					controller: "PromotionsCtrl"
				}
			}
		})

		.state("Main.Promotions.Scheduled", {
			url: "/scheduled",
			templateUrl: "views/main/promotions/promotions_scheduled.html",
			controller: "PromotionsScheduledCtrl",
			resolve: {
				SCHEDULED: ["api", function(api) {
					return api.get("promotions/scheduled");
				}]
			}
		})

		.state("Main.Promotions.List", {
			url: "/list",
			templateUrl: "views/main/promotions/promotions_list.html",
			controller: "PromotionsListCtrl",
			resolve: {
				PROMOTIONS: ["api", function(api) {
					return api.get("promotions");
				}]
			}
		})

		.state("Main.Promotions.New", {
			url: "/new?promoID&custom",
			templateUrl: "views/main/promotions/promotions_new.html",
			controller: "PromotionsNewCtrl"
		})

		.state("Main.Promotions.Edit", {
			url: "/edit",
			templateUrl: "views/main/promotions/promotions_edit.html",
			controller: "PromotionsEditCtrl"
		})

		.state("Main.Promotions.Date", {
			url: "/date?isEditing",
			templateUrl: "views/main/promotions/promotions_date.html",
			controller: "PromotionsDateCtrl"
		})

		.state("Main.Promotions.Window", {
			url: "/window",
			templateUrl: "views/main/promotions/promotions_window.html",
			controller: "PromotionsWindowCtrl"
		})

		.state("Main.Promotions.Social", {
			url: "/social",
			templateUrl: "views/main/promotions/promotions_social.html",
			controller: "PromotionsSocialCtrl"
		})

		.state("Main.Promotions.TMDetail", {
			url: "/tmdetail",
			templateUrl: "views/main/promotions/team_member_detail.html",
			controller: "PromotionsTeamDetailCtrl"
		});
	}
]);
