angular.module("taffer.directives")
.directive("fmVideo", [
	function() {
		return {
			restrict: "A",
			scope: {
				auto: "@",
				end: "&"
			},
			link: function(scope, elem, attr) {
				if(scope.auto) {
					elem.click();
				}

				elem.bind("ended", function() {
					scope.end();
				});

			}
		};
	}
]);
