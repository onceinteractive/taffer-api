angular.module("taffer.controllers")
.controller("MessageCtrl", [
  "$scope",
  "$state",
  "api",
  "MessageService",
  "SuggestionService",
  "AuthService",
  "RECIPIENTS",
  "SUGGESTIONS",
  "spinner",
  function(scope, state, api, messageService, suggestionService, authService, RECIPIENTS, SUGGESTIONS, spinner) {
    scope.auth = authService;
    scope.recipients = RECIPIENTS;
    scope.suggestions = SUGGESTIONS;
    scope.selectedRecipients = [];
    scope.tab = 'mail';
    scope.preventUIUpdate = false;
    scope.deleting = false;

    (function() {
      window.scrollTo(0,0);
    })();

    (function() {
      scope.messageThreads = messageService.getMessagesFromCache();
    })();

    scope.$on("messages-cache:updated", function() {
      if(!scope.preventUIUpdate) {
        scope.messageThreads = messageService.getMessagesFromCache();
      }
    });

    scope.$watch('messageThreads', function() {
      if(scope.tab == "mail") {
        if(scope.messageThreads && scope.messageThreads.length > 0) {
          scope.$emit("child-show-edit");
        } else {
          scope.$emit("child-hide-edit");
        }
      }
    });

    scope.$watch('suggestions', function() {
      if(scope.tab == 'suggestion') {
        if(scope.suggestions && scope.suggestions.length > 0) {
          scope.$emit("child-show-edit");
        } else {
          scope.$emit("child-hide-edit");
        }
      }
    });

    scope.$on("parent-edit", function() {
      scope.deleting = true;
      scope.$emit("child-show-done");
    });

    scope.$on("parent-done", function() {
      scope.deleting = false;
      scope.selectedObject = null;
      scope.$emit("child-hide-done");

      if(scope.tab == 'mail') {
        // Update messages once we've finished deleting
        scope.preventUIUpdate = false;
        messageService.getMessages()
          .then(function(data) {
            // Nothing to do
          }, function(error) {
            console.log(error);
          });
      } else if(scope.tab == 'suggestion') {
        // Update suggestions after deleting
        scope.updateSuggestions();
      }

    });

    // Prevents the UI from updating/reloading messages while deleting messages
    scope.$watch('showDoneButton', function() {
      if(scope.showDoneButton && scope.tab == 'mail') {
        scope.preventUIUpdate = true;
      }
    });

    scope.updateTab = function(tab) {
      scope.tab = tab;
    };

    scope.updateSuggestions = function() {
      spinner.override();
      suggestionService.getSuggestions(true)
        .then(function(data) {
          scope.suggestions = data;
        }, function(error) {
          console.log(error);
        });
    };

  }
]);
