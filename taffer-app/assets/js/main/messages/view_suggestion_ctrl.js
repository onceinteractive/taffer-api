angular.module("taffer.controllers")
.controller("ViewSuggestionCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "SuggestionService",
  function(scope, state, params, api, suggestionService) {
    scope.suggestion = null;

    (function() {
      window.scrollTo(0,0);
    })();

    scope.$on("parent-back", function() {
      scope.updateTab("suggestion");
      state.go("Main.Messages.List");
    });

    if(params.suggestionId) {
      suggestionService.getById(params.suggestionId)
        .then(function(data) {
          scope.suggestion = data;
        }, function(error) {
          console.log(error);
        })
    }

  }
]);
