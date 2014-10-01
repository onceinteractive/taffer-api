angular.module("taffer.controllers")
.controller("PreshiftNewCtrl", [
  "$scope",
  "$state",
  "$ocModal",
  "api",
  "KeenIO",
  function(scope, state, modal, api, keenIO) {
    scope.imageKey = null;
    scope.file = null;

    scope.deleteRecipient = function(recipient) {
      var index = scope.selectedRecipients.indexOf(recipient);
      if(index > -1) {
        scope.selectedRecipients.splice(index, 1);
      }
    };

    scope.cancel = function() {
      scope.updateNewMessage("");
      scope.updateNewTitle("");
      scope.updateAllSelected(false);
      scope.selectedRecipients.length = 0;
      state.go("Main.Preshift.List");
    };

    scope.selectRecipients = function() {
      scope.updateNewMessage(scope.newMessage);
      scope.updateNewTitle(scope.newTitle);
      state.go("Main.Preshift.Recipients");
    };

    scope.removeImage = function() {
      if(scope.file && scope.imageKey) {
        scope.file = null;
        scope.imageKey = null;
      }
    };

    scope.save = function() {
      getRecipientIds(function(recipientIds) {
        if(recipientIds.length > 0) {
          if(scope.newMessage && scope.newMessage !== "") {
            var postData = {
                to: recipientIds,
                message: scope.newMessage,
                title: scope.newTitle
            }

            if(scope.file) {
                postData.image = scope.file;
            }

            var promise = api.post("preshift", postData);
            promise.success(function(data, status, headers, config) {
              keenIO.addEvent('preshiftNew', {
                user: scope.auth.getUser()._id,
                bar: scope.auth.getUser()._id,
                message: scope.newMessage.length,
                image: scope.file ? true : false
              })

              scope.updateNewMessage("");
              scope.updateNewTitle("");
              scope.updateAllSelected(false);
              scope.sentMessages.unshift(data);
              scope.updateSelectedTab('sent');

              state.go("Main.Preshift.List");
            });

            promise.error(function(data, status, headers, config) {
              console.log(data);
              console.log(status);
            });
          } else {
            modal.open({
              url: "views/modals/error_message.html",
              cls: "fade-in",
              init: {
                errorMessage: "The message field cannot be empty."
              }
            });
          }
        } else {
          modal.open({
            url: "views/modals/error_message.html",
            cls: "fade-in",
            init: {
              errorMessage: "You must select at least one recipient."
            }
          });
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
    };

	scope.imageSuccess = function(result) {
		scope.imageKey = result.uri;
		scope.$apply();
	};

    scope.unselectAll = function() {
      scope.updateAllSelected(false);
    }


  }
]);
