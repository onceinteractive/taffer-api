angular.module("taffer.controllers")
.controller("PreshiftRecipientsCtrl", [
  "$scope",
  "$state",
  "api",
  function(scope, state, api) {
    scope.selectedRecipient = null;

    scope.back = function() {
      state.go("Main.Preshift.New");
    };

    scope.done = function() {
      state.go("Main.Preshift.New");
    };

    scope.selectRecipient = function(recipient) {
      if(scope.allSelected){
        scope.updateAllSelected(false);
      }
      
      var index = scope.selectedRecipients.indexOf(recipient);
      if(index > -1) {
        scope.selectedRecipients.splice(index, 1);
      } else {
        scope.selectedRecipients.push(recipient);
      }

      if(scope.selectedRecipient == recipient) {
        scope.selectedRecipient = null;
      } else {
        scope.selectedRecipient = recipient;
      }
    };

    scope.isSelected = function(recipient) {
      return scope.selectedRecipients.indexOf(recipient) > -1
    };

    scope.selectAll = function() {
      scope.updateAllSelected(true);
      state.go("Main.Preshift.New");
    };

  }
]);
