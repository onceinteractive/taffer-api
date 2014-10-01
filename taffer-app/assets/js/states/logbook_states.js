angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.LogBook", {
			abstract: true,
			url: "/logbook",
			views: {
				"logbook": {
					template: '<div id="l-logbook" class="view" ui-view></div>',
					controller: "LogBookCtrl",
					resolve: {
						LOGS: ["api", function(api) {
							return api.get("logbook");
						}]
					}
				}
			}
		})

		.state("Main.LogBook.List", {
			url: "/logbooklist",
			templateUrl: "views/main/logbook/logbook_list.html",
			controller: "LogBookListCtrl",
		})

		.state("Main.LogBook.NewLogEntry", {
			url: "/newLogEntry",
			templateUrl: "views/main/logbook/logbook_entry.html",
			controller: "LogBookEntryCtrl"
		})

		.state("Main.LogBook.View", {
			url: "/viewLogEntry",
			templateUrl: "views/main/logbook/logbook_view.html",
			controller: "LogBookViewCtrl"
		});
	}
]);
