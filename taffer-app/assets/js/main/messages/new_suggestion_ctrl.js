angular.module("taffer.controllers")
.controller("NewSuggestionCtrl", [
  "$scope",
  "$state",
  "api",
  "SuggestionService",
  function(scope, state, api, suggestionService) {
    scope.newSuggestion = "";

    scope.cancel = function() {
      scope.updateTab("suggestion");
      state.go("Main.Messages.List");
    }

    scope.submit = function() {
      if(scope.newSuggestion !== "") {
        suggestionService.saveSuggestion({message: scope.newSuggestion})
          .then(function(data) {
            scope.suggestion = "";
            scope.suggestions.push(data);
            scope.updateSuggestions();
            scope.updateTab("suggestion");
            state.go("Main.Messages.List");
          }, function(error) {
            console.log(error);
          });
      }
    }

  }
]);
