angular.module("taffer.controllers")
.controller("LogBookCtrl", [
	"$scope",
	"$state",
	"api",
	"LOGS",
	"AuthService",
	function(scope, state, api, LOGS, auth) {
		scope.auth = auth;

		scope.logs = LOGS.data;
		scope.isSearching = false;
		scope.selectedLog = null;

		(function() {
      window.scrollTo(0,0);
    })();

		scope.newLogThread = {
			title: "",
			message: "",
			priority: false,
			imageKey: null
		};

		scope.updateSelectedLog = function(log) {
			scope.selectedLog = log;
		};

		scope.addSearchLogs = function(searchResults) {
			scope.logs = searchResults;
		};

		scope.updateIsSearching = function(isSearching) {
			scope.isSearching = isSearching;
		};

		scope.resetLogs = function() {
			scope.logs = LOGS.data;
		};

	}
]);
