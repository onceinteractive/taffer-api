angular.module("taffer.controllers")
.controller("SpinnerCtrl", [
	"$scope",
	function(scope) {
		scope.showSpinner = false;

		scope.$on("spinner:start", function(e) {
			scope.showSpinner = true;
		});

		scope.$on("spinner:stop", function(e) {
			scope.showSpinner = false;
		});

	}
]);
