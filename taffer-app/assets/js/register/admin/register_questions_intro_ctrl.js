angular.module("taffer.controllers")
.controller("RegisterQuestionsIntroCtrl", [
	"$scope",
	"$state",
	function(scope, state) {
		scope.$on("reg-next", function(event) {
			state.go("Registration.BarQuestions");
		});

		scope.$on("reg-back", function(event) {
			state.go("Registration.BarInfo");
		});

		scope.ok = function() {
			state.go("Registration.BarQuestions");
		};

		scope.$emit("hideBack");
	}
]);
