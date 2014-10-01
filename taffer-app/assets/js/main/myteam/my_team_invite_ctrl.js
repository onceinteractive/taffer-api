angular.module("taffer.controllers")
.controller("MyTeamInviteCtrl", [
  "$scope",
  "$state",
  "$ocModal",
  "api",
  "AuthService",
  "KeenIO",
  function(scope, state, modal, api, auth, keenIO) {
    scope.newContactInfo = null;

    (function() {
      window.scrollTo(0,0);
    })();

    // Show Modal
    if(scope.showInviteModal) {
      modal.open({
        url: "views/modals/invite.html",
        cls: "fade-in l-invite-modal-override",
        onClose: function() {
          scope.updateShowInviteModal(false);
        }
      });
    }

    scope.cancel = function() {
      scope.clearSelectedContacts();
      state.go("Main.MyTeam.List");
    };

    scope.addNewContact = function() {
      if(event.which === 13) {
        scope.addContact();
      }
    };

    scope.addContact = function() {
      if(scope.newContactInfo && isValidInput()) {
        scope.selectedContacts[scope.newContactInfo] = true;
        scope.newContactInfo = null;
      } else {
        modal.open({
            url: "views/modals/error_message.html",
            cls: "fade-in",
            init: {
                errorMessage: "Please enter a valid email or phonenumber."
            }
        });
      }
    };

    scope.removeSelectedContact = function(selectedContact) {
      delete scope.selectedContacts[selectedContact];
      console.log(scope.selectedContacts);
    };

    scope.findEmployees = function() {
      if(scope.foundContacts && scope.foundContacts.length > 0) {
        state.go("Main.MyTeam.Contacts");
      } else {
        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;

        var fields = ["name", "phoneNumbers", "emails"];

        navigator.contacts.find(fields, function(contacts){
          scope.updateFoundContacts(contacts);
          state.go("Main.MyTeam.Contacts");
        }, function(err){
          alert(err);
        }, options);

      }
    };

    scope.save = function() {
      if(scope.selectedContacts) {
        var toEmail = [];
        var toSMS = [];
        var keys = Object.keys(scope.selectedContacts);
        var emailSent = false;
        var smsSent = false;

        angular.forEach(scope.selectedContacts, function(value, key) {
          if(value) {
            if(key.indexOf('@') > -1 && key.indexOf('.com') > -1) {
              toEmail.push(key);
            } else {
              var cleanedKey = key.replace(/[^\d]/g,'');
              if(cleanedKey.length == 10 || cleanedKey.length == 11){
                toSMS.push(cleanedKey);
              }
            }
          }
        });

        if(toEmail.length > 0 || toSMS.length > 0) {
          var promise = api.post("invite", {
            phoneNumbers: toSMS,
            emails: toEmail
          });
          promise.success(function(data, status, headers, config) {
            scope.clearSelectedContacts();
            state.go("Main.MyTeam.List");

            keenIO.addEvent('myTeamInvite', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              emails: toEmail.length,
              smses: toSMS.length
            })
          });

          promise.error(function(data, status, headers, config) {
            console.log(data);
            console.log(status);
          });
        }

      }
    };

    function isValidInput() {
        var input = scope.newContactInfo;
        if(!input) return false;
        if(input.indexOf("@") > -1) {
            // Email validation
            var match = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-]+$/.exec(input);
            return match
        } else {
            // Phone number validation
            var match = /[A-Za-z]/.exec(input);
            return !match;
        }
    };

  }
]);
