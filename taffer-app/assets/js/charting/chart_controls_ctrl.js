angular.module("taffer.controllers")
.controller("ChartControlsCtrl", [
	"$scope",
	"api",
	function(scope, api) {
		scope.data = [];

		function updateData() {
			var seed, startDate, endDate, startFormat, endFormat;

			seed = moment();
			startDate = getStartDate(seed);
			endDate = getEndDate(seed);

			startFormat = startDate.getFullYear() + "-" +
				(startDate.getMonth() + 1) + "-" +
				startDate.getDate();

			endFormat = endDate.getFullYear() + "-" +
				(endDate.getMonth() + 1) + "-" +
				endDate.getDate();

			var params = "?startDate=" + startFormat + "&endDate=" + endFormat;
			var promise = api.get("sales" + params);
			promise.success(function(data, status, config, headers) {
				if(status === 200) {
					scope.data = data;
				}
			});

			promise.error(function(data, status, config, headers) {
				console.log(status);
				console.log(data);
			});
		};

		function getStartDate(seed) {
			if(scope.granularity === "weekly") return seed.clone().startOf("week").subtract(6, "week").toDate();
			if(scope.granularity === "monthly") return seed.clone().startOf("month").subtract(6, "month").toDate();
			if(scope.granularity === "yearly") return seed.clone().startOf("year").subtract(6, "year").toDate();
		};

		function getEndDate(seed) {
			return seed.clone().endOf("day").toDate();
		};

		function updateLabel() {
			if(scope.type === "sales") scope.label = "TOTAL SALES";
			if(scope.type === "guest") scope.label = "TOTAL GUEST COUNT";
		}

		scope.type = "sales";
		scope.granularity = "weekly";
		updateLabel();

		scope.nextChart = function() {
			scope.type = scope.type === "sales" ? "guest" : "sales";
			updateLabel();
		};

		scope.previousChart = function() {
			scope.type = scope.type === "sales" ? "guest" : "sales";
			updateLabel();
		};

		scope.updateGranularity = function(g) {
			scope.granularity = g;
			updateData();
		};

		scope.isSelected = function(g) {
			return (scope.granularity === g);
		};

		scope.getIndex = function() {
			return scope.type === "sales" ? 1 : 2;
		};

		updateData();
	}
]);
