angular.module("taffer.controllers")
.controller("PreshiftCtrl", [
  "$scope",
  "$state",
  "api",
  "PRESHIFTMSGS",
  "RECIPIENTS",
  "AuthService",
  function(scope, state, api, PRESHIFTMSGS, RECIPIENTS, auth) {
    scope.auth = auth;
    scope.recipients = RECIPIENTS.data;
    scope.receivedMessages = [];
    scope.sentMessages = [];
    scope.selectedTab = 'received';
    scope.selectedRecipients = [];
    scope.allSelected = false;
    scope.selectedMessage = null;

    scope.newMessage = "";
    scope.newTitle = "";

    var windowHeight = window.innerHeight - 50;
    scope.preshiftContainerStyle =  {"min-height" : windowHeight};

    if(PRESHIFTMSGS.data) {

      if(auth.hasPermission('preshift', 'send')) {
        PRESHIFTMSGS.data.forEach(function(message) {
          if(auth.getUser()._id == message.by._id) {
            scope.sentMessages.push(message);
          } else {
            scope.receivedMessages.push(message);
          }
        });
      } else {
        scope.receivedMessages = PRESHIFTMSGS.data;
      }

    }

    scope.updateSelectedMessage = function(message) {
      scope.selectedMessage = message;
    };

    scope.updateSelectedTab = function(tab) {
      scope.selectedTab = tab;
    };

    scope.updateAllSelected = function(areAllSelected) {
      if(areAllSelected) {
        scope.selectedRecipients = angular.copy(scope.recipients);
        scope.allSelected = true;
      } else {
        scope.selectedRecipients = [];
        scope.allSelected = false;
      }
    };

    scope.updateNewMessage = function(newMessage) {
      scope.newMessage = newMessage;
    };

    scope.updateNewTitle = function(newTitle) {
      scope.newTitle = newTitle;
    };

  }
]);
