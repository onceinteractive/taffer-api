angular.module("taffer.directives")
.directive("fmSwitch", [
	function() {
		return {
			restrict: "E",
			templateUrl: "templates/switch.html",
			scope: {
				model: "=",
				onText: "@",
				offText: "@",
				special: "@"
			},
			link: function(scope, elem, attr) {
				scope.model = false;
			}
		};
	}
]);
