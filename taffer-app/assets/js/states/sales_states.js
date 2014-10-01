angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Sales", {
			url: "/sales",
			views: {
				"sales": {
					template: "<div id='l-sales' class='view' ui-view></div>",
					controller: "SalesCtrl"
				}
			}
		})

		.state("Main.Sales.View", {
			url: "/view",
			templateUrl: "views/main/sales/view.html",
			controller: "SalesViewCtrl"
		})

		.state("Main.Sales.Trends", {
			url: "/trends",
			templateUrl: "views/main/sales/trends.html",
			controller: "SalesTrendsCtrl",
			resolve: {
				SALES: ["api", function(api) {
					return api.get("sales/all");
				}]
			}
		})

		.state("Main.Sales.Edit", {
			url: "/edit",
			templateUrl: "views/main/sales/edit.html",
			controller: "SalesEditCtrl",
			resolve: {
				SALES: ["api", function(api) {
					var seed = moment();
					var start = seed.clone().startOf("month").format("YYYY-MM-DD");
					var end = seed.clone().endOf("month").format("YYYY-MM-DD");
					var format = "?startDate=" + start + "&endDate=" + end;

					return api.get("sales" + format);
				}]
			}
		});
	}
]);
