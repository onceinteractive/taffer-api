angular.module("taffer.controllers")
.controller("SalesTrendsCtrl", [
	"$scope",
	"$state",
	"d3Service",
	"SALES",
	function(scope, state, d3s, SALES) {
		console.log(SALES);
		scope.data = [];

		if(SALES.status === 200) {
			// Sort Data
			var data = SALES.data;
			data.sort(function(a, b) {
				var aDate = d3s.getDate(a[0]);
				var bDate = d3s.getDate(b[0]);
				return d3.ascending(aDate, bDate);
			});

			scope.data = data;
			console.log(scope.data);
		}

		scope.back =  function() {
			state.go("Main.Sales.View");
		};

		scope.topDay = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.day, 1);
			bin.map(function(x) { x.date = d3s.getDate(x.key); });

			bin.sort(function(a,b) {
				return d3.descending(a.values, b.values);
			});

			return bin[0];
		};

		scope.worstDay = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.day, 1);
			bin.map(function(x) { x.date = d3s.getDate(x.key); });

			bin.sort(function(a,b) {
				return d3.ascending(a.values, b.values);
			});

			return bin[0];
		};

		scope.avgDaily = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.day, 1);
			var sum = d3.sum(bin, function(x) { return x.values; });

			return sum / bin.length;
		};

		scope.avgWeekly = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.week, 1);
			var sum = d3.sum(bin, function(x) { return x.values; });

			return sum / bin.length;
		};

		scope.avgMonthly = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.month, 1);
			var sum = d3.sum(bin, function(x) { return x.values; });

			return sum / bin.length;
		};

		scope.avgYearly = function() {
			if(scope.data.length === 0) return "- - - -";
			var bin = d3s.createBin(scope.data, d3.time.year, 1);
			var sum = d3.sum(bin, function(x) { return x.values; });

			return sum / bin.length;
		};
	}
]);
