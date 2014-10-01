angular.module("taffer.directives")
.directive("fmCheckbox", [
	function() {
		return {
			restrict: "E",
			template: '
				<label class="m-checkbox">
					<input type="checkbox" name="{{name}}" ng-model="model">
					<span></span>
					{{label}}
				</label>
			',
			scope: {
				model: "=",
				label: "@",
				name: "@"
			}
		}
	}
]);
