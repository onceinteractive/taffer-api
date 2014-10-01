angular.module("taffer.controllers")
.controller("MessageListCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "$ocModal",
  "MessageService",
  "SuggestionService",
  "spinner",
  "KeenIO",
  function(scope, state, params, api, modal, messageService, suggestionService, spinner, keenIO) {
    scope.suggestion = "";

    // scope.selectedMessage = null;
    scope.selectedObject = null;

    // This will make the default background black for this container
    // Why? Because a div cannot fill 100% height unless a pixel height is set
    var windowHeight = window.innerHeight - 50;
    scope.containerStyle =  {"min-height" : windowHeight};

    scope.showBox = function(tabName) {
      scope.updateTab(tabName);
      if(scope.tab == 'mail' && scope.messageThreads && scope.messageThreads.length > 0) {
        scope.$emit("child-show-edit");
      } else if(scope.tab  == 'suggestion' && scope.suggestions && scope.suggestions.length > 0) {
        scope.$emit("child-show-edit");
      } else {
        scope.$emit("child-hide-edit");
      }
    };

    if(params.tab) {
      scope.showBox(params.tab);
    }

    scope.getParticipantNames = function(participants) {
      var names = [];
      participants.forEach(function(pax) {
        names.push(pax.firstName);
      });
      return names.join(", ");
    };

    scope.writeNew = function() {
      if(scope.tab == 'suggestion' && scope.auth.hasPermission('suggestionBox', 'read')) {
        scope.$emit("child-hide-done");
        state.go("Main.Messages.NewSuggestion");
      } else {
        scope.$emit("child-hide-done");
        state.go("Main.Messages.NewMessage");
      }
    }

    scope.viewConversation = function($index) {
      scope.$emit("child-hide-done");
      state.go("Main.Messages.ViewConversation", {index: $index});
    }

    scope.getLatestTimestamp = function(messages) {
      if(messages.length > 0) {
        return messages[messages.length - 1].sentOn;
      } else {
        return moment('2000-01-01').fromNow();
      }
    }

    scope.getLatestMessage = function(messages) {
      if(messages.length > 0) {
        return messages[messages.length - 1].message;
      } else {
        return "";
      }
    }

    scope.toggleObject = function(object) {
      if(scope.selectedObject == object) {
        scope.selectedObject = null;
      } else {
        scope.selectedObject = object;
      }
    };

    scope.isObjectSelected = function(object) {
      return scope.selectedObject == object;
    };

    scope.deleteMessage = function(messageThread) {
      var index = scope.messageThreads.indexOf(messageThread);

      messageService.delete(messageThread._id)
        .then(function(data) {
          scope.messageThreads.splice(index, 1);
          if(scope.messageThreads && scope.messageThreads.length == 0) {
            scope.$emit("child-hide-edit");
            scope.$emit("child-hide-done");
            scope.deleting = false;
          }
        }, function(error) {
          console.log(error);
        });
    };

    scope.deleteSuggestion = function(suggestion) {
      var index = scope.suggestions.indexOf(suggestion);

      suggestionService.delete(suggestion._id)
        .then(function(data) {
          scope.suggestions.splice(index, 1);
          if(scope.suggestions && scope.suggestions.length == 0) {
            scope.$emit("child-hide-edit");
            scope.$emit("child-hide-done");
            scope.deleting = false;
          }
        }, function(error) {
          console.log(error);
        });
    };

    scope.submitSuggestion = function() {
      if(scope.suggestion !== "") {

        suggestionService.saveSuggestion({message: scope.suggestion})
          .then(function(data) {
            modal.open({
              url: "views/modals/feedback_message.html",
              init: {
                feedbackMessage: "Suggestion submitted."
              },
              cls: "fade-in m-modal-feedback"
            });

            keenIO.addEvent('suggestionNew', {
              user: scope.auth.getUser()._id,
              bar: scope.auth.getUser().barId,
              suggestion: scope.suggestion.length
            })
            scope.suggestion = "";
          }, function(error) {
            console.log(error);
          });
      }
    };

    scope.viewSuggestion = function(suggestion) {
      state.go("Main.Messages.ViewSuggestion", {suggestionId: suggestion._id});

      keenIO.addEvent('suggestionRead', {
        user: scope.auth.getUser()._id,
        bar: scope.auth.getUser().barId,
        suggestion: suggestion._id
      })
    };

  }
]);
