angular.module("taffer.controllers")
.controller("SalesCtrl", [
	"$scope",
	"promiseCache",
	function(scope, promiseCache) {
		promiseCache.remove("salesDashboardCache", false); // Invalidate cache so fresh data is pulled for dashboard
	}
]);
