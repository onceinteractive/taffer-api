angular.module("taffer.controllers")
.controller("NewMessageCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "$ocModal",
  "MessageService",
  "KeenIO",
  "AuthService",
  function(scope, state, params, api, modal, messageService, keenIO, auth) {
    scope.showSelectRecipients = false;
    scope.newMessage = "";
    scope.file = "";
    scope.selectedRecipient = null;
    scope.toAdd = [];
    scope.toRemove = [];

    if(params.userId) {
      var to = {
        _id: params.userId,
        firstName: params.firstName,
        lastName: params.lastName
      }
      scope.selectedRecipients.push(to);
    }

    scope.deleteRecipient = function(recipient) {
      var index = scope.selectedRecipients.indexOf(recipient);
      if(index > -1) {
        scope.selectedRecipients.splice(index, 1);
      }
    }

    scope.cancel = function() {
      scope.selectedRecipients.length = 0;
      scope.updateTab("mail");
      state.go("Main.Messages.List");
    }

    scope.sendMessage = function() {
      getRecipientIds(function(recipientIds) {
        if(recipientIds.length > 0){
          if(scope.newMessage && scope.newMessage !== "") {

            var cleanedText = scope.newMessage.replace(/(<([^>]+)>)/ig,"");
            cleanedText = cleanedText.replace(/&nbsp;/gi,"");

            var postData = {
                to: recipientIds,
                message: cleanedText,
            };

            if(scope.file) {
                postData.image = scope.file;
            }

            messageService.saveMessage(postData)
              .then(function(data) {
                scope.newMessage = "";
                scope.selectedRecipients.length = 0;
                var length = scope.messageThreads.unshift(data);
                if(length > 0) {
                  scope.$emit("child-show-edit");
                }
                state.go("Main.Messages.ViewConversation", {index: 0});
                keenIO.addEvent("messageNew", {
                  user: auth.getUser()._id,
                  bar: auth.getUser().barId,
                  length: cleanedText.length,
                  to: recipientIds.length,
                  image: scope.file ? true : false
                })
              }, function(error) {
                console.log(error);
              });

          } else {
            showModal("The message input cannot be empty.");
          }
        } else {
          showModal("You must add at least one recipient.");
          scope.$broadcast("message-input:enable");
        }
      });

      function getRecipientIds(callback) {
        var recipientIds = [];
        var length = scope.selectedRecipients.length;
        for(var i = 0; i < length; i++) {
          recipientIds.push(scope.selectedRecipients[i]._id);
        }
        return callback(recipientIds);
      }

    }

    scope.selectRecipients = function() {
      scope.showSelectRecipients = true;
    }

    function showModal(errorMessage) {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: errorMessage
        }
      });
    };


    //***************** RECIPIENT SELECTION METHODS **********************
    scope.cancelSelectRecipients = function() {
      scope.toAdd = [];
      scope.toRemove = [];
      scope.showSelectRecipients = false;
    };

    scope.done = function() {
      for(var i = 0, len = scope.toRemove.length; i < len; i++) {
        var subtraction = scope.toRemove[i];
        var minusIndex = scope.selectedRecipients.indexOf(subtraction);
        scope.selectedRecipients.splice(minusIndex, 1);
      }

      for(var j = 0, length = scope.toAdd.length; j < length; j++) {
        var addition = scope.toAdd[j];
        scope.selectedRecipients.push(addition);
      }

      scope.toAdd =[];
      scope.toRemove = [];
      scope.showSelectRecipients = false;
    };

    scope.selectRecipient = function(recipient) {
      var index = scope.selectedRecipients.indexOf(recipient);
      if(index > -1) {
        scope.toRemove.push(recipient);
      } else {
        var addIndex = scope.toAdd.indexOf(recipient);
        if(addIndex > -1) {
          scope.toAdd.splice(addIndex, 1);
        } else {
          scope.toAdd.push(recipient);
        }
      }

      if(scope.selectedRecipient == recipient) {
        scope.selectedRecipient = null;
      } else {
        scope.selectedRecipient = recipient;
      }
    };

    scope.isSelected = function(recipient) {
      var selectedIndex = scope.selectedRecipients.indexOf(recipient);
      var toRemoveIndex = scope.toRemove.indexOf(recipient);
      var toAddIndex = scope.toAdd.indexOf(recipient);

      if(toRemoveIndex > -1) {
        return false;
      } else if(selectedIndex > -1 || toAddIndex > -1) {
        return true;
      }
    };

  }
]);
