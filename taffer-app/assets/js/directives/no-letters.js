angular.module("taffer.directives")
.directive("noLetters", [
	function() {
		return {
			require: "ngModel",
			link: function(scope, element, attr, ngModelCtrl) {
				function fromUser(text) {
					var transformedInput = text.replace(/[^0-9]/g, "");
					if(transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}

					return transformedInput;
				}
				ngModelCtrl.$parsers.push(fromUser);
			}
		};
	}
]);
