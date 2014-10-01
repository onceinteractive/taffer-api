angular.module("taffer.controllers")
.controller("ViewQuestionCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  function(scope, state, params, api) {
    scope.question = null;

    if(params.questionId) {
      (function() {
        var promise = api.get("questions/" + params.questionId);
        promise.success(function(data, status, headers, config) {
          console.log(data);
          scope.question = data;
        });

        promise.error(function(data, status, headers, config) {
          console.log(status);
          console.log(data);
        });
      })()
    }

    scope.$on("parent-back", function(event) {
      state.go("Main.Questions");
    });

  }
])
