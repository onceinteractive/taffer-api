angular.module("taffer.controllers")
.controller("ProfileCtrl", [
  "$scope",
  "$state",
  "$ocModal",
  "api",
  "SocialService",
  "STATES",
  "USER",
  "BARTYPES",
  "cordovaService",
  "AuthService",
  "KeenIO",
  function(scope, state, modal, api, social, STATES, USER, BARTYPES, cordovaService, auth, keenIO) {
      scope.auth = auth;
    console.log(USER.data);
    if(USER.data) {
      scope.updateUserInfo(USER.data);
    }

    if(auth.getUser().twitter ||
        (scope.bar.twitter && auth.hasPermission('social', 'manage'))) {
        scope.twitterSuccess = true;
    }

    if(auth.getUser().facebook || (scope.bar.facebook && auth.hasPermission('social', 'manage'))) {
        scope.fbSuccess = true;
    }

    scope.barTypes = BARTYPES.data;
    scope.states = STATES;

    scope.imageKey = null;

    scope.tempUser = angular.copy(auth.getUser());
    scope.tempBar = angular.copy(scope.bar);

    scope.back = function() {
      state.go("Main.Landing");
    };

    scope.confirmNewBarCode = function() {
      modal.close();

      var promise = api.post("bar/code/new");
      promise.success(function(data, status, headers, config) {
        keenIO.addEvent('profileEditBarcode', {
          user: auth.getUser()._id,
          bar: auth.getUser().barId,
        })

        scope.updateBarInfo(data);
        scope.tempBar = data;
      });

      promise.error(function(data, status, headers, config) {
        console.log(data)
        console.log(status);
      });
    };

    scope.submitInfo = function() {
      if(event.which === 13) {
        scope.save();
      }
    };

    scope.isUserChanged = function(input) {
      if(input.$dirty) {
        if(auth.getUser() && auth.getUser()[input.$name] !== input.$modelValue) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    scope.isBarChanged = function(input, barAttribute) {
      if(input.$dirty) {
        if(scope.bar && scope.bar[barAttribute] !== input.$modelValue) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    scope.isBarSelectChanged = function(barAttribute) {
      if(scope.bar[barAttribute] !== scope.tempBar[barAttribute]) {
        return true;
      } else {
        return false;
      }
    };

    scope.generateNewBarCode = function() {
      var modalFunctions = {
        confirmNewBarCode: scope.confirmNewBarCode
      };

      modal.open({
        url: "views/modals/generate_bar_code.html",
        cls: "fade-in l-myprofile-modal-buttons",
        init: modalFunctions
      });
    };

    scope.save = function() {
      if(scope.myProfileForm.$valid && validPassword()) {

        updateUser(function() {
            updateBar(function() {
                state.go("Main.Landing");
            });
        });

        function updateUser(callback) {
            var data = {
                email: scope.tempUser.email,
                firstName: scope.tempUser.firstName,
                lastName: scope.tempUser.lastName,
                role: scope.tempUser.role
            };

            if(scope.tempUser.password) {
                data.password = scope.tempUser.password;
            }

            if(scope.file) {
                data.image = scope.file;
            }

            var userPromise = api.put("users/" + auth.getUser()._id, data);
            userPromise.success(function(data, status, headers, config) {
                keenIO.addEvent('profileEditUser', {
                  user: auth.getUser()._id,
                  bar: auth.getUser().barId,
                  image: scope.file ? true : false
                })

                scope.updateUserInfo(data);
                callback();
            });

            userPromise.error(function(data, status, headers, config) {
                console.log(data)
                console.log(status);
                callback();
            });
        };

        function updateBar(callback) {
          if(auth.hasPermission('bars', 'edit')) {
            var barPromise = api.put("bar/" + scope.bar._id, scope.tempBar);
            barPromise.success(function(data, status, headers, config) {
              keenIO.addEvent('profileEditBar', {
                user: auth.getUser()._id,
                bar: auth.getUser().barId,
              })

              scope.updateBarInfo(data);
              callback();
            });

            barPromise.error(function(data, status, headers, config) {
              console.log(data)
              console.log(status);
              callback();
            });
          } else {
            callback();
          }
        };

      } else {
        feedback();
      }
    };

    scope.imageSuccess = function(result) {
        scope.imageKey = scope.file;
        scope.$apply();
    };

    scope.clearPassword = function() {
      if(scope.tempUser.password == "") {
        scope.tempUser.passwordConfirm = "";
      }
    };

    scope.linkFacebook = function() {
        if(auth.hasPermission('social', 'manage')) {
            social.linkFacebookBar(fbSuccess, function(err) {
                console.log("Error linking FB", err);
                scope.fbError = true;

                if(err){
                  keenIO.addEvent('facaebookLink', {
                    linkType: 'bar',
                    user: auth.getUser()._id,
                    bar: auth.getUser().barId,
                    result: 'error',
                    error: err
                  })
                } else {
                  keenIO.addEvent('facaebookLink', {
                    linkType: 'bar',
                    user: auth.getUser()._id,
                    bar: auth.getUser().barId,
                    result: 'success'
                  })
                }
            });
            return;
        } else {
            social.linkFacebookUser(fbSuccess, function(err) {

                if(err){
                  keenIO.addEvent('facaebookLink', {
                    linkType: 'user',
                    user: auth.getUser()._id,
                    bar: auth.getUser().barId,
                    result: 'error',
                    error: err
                  })
                } else {
                  keenIO.addEvent('facebookLink', {
                    linkType: 'user',
                    user: auth.getUser()._id,
                    bar: auth.getUser().barId,
                    result: 'success'
                  })
                }

                console.log("Error linking FB", err);
                scope.fbError = true;
            });
            return;
        }
    };

    scope.unlinkFacebook = function() {
        console.log("Unlink Facebook Clicked");
      cordovaService.dialogs.confirm(
        'Unlink Facebook account?', 'Are you sure that you want to unlink your Facebook account?',
        function() {
          var unlinkFacebookPromise = api.delete("facebook/deactivate");
          unlinkFacebookPromise.success(function(data, status, headers, config) {
            keenIO.addEvent('facebookUnLink', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              result: 'success'
            })
            scope.fbSuccess = false;
          });

          unlinkFacebookPromise.error(function(data, status, headers, config) {
            keenIO.addEvent('facebookUnLink', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              result: 'error',
              error: data
            })

            modal.open({
              url: "views/modals/error_message.html",
              cls: "fade-in",
              init: {
                errorMessage: 'Something has gone wrong - please try again later.'
              }
            });
          });
        },
        null
      )
    };

    scope.linkTwitter = function() {
        console.log("Unlink Twitter Clicked");
        if(auth.hasPermission('social', 'manage')) {
            social.linkTwitterBar(twitterSuccess, function(err) {
                keenIO.addEvent('twitterLink', {
                  user: auth.getUser()._id,
                  bar: auth.getUser().barId,
                  result: 'success'
                })

                console.log("Error linking Twitter", err);
                scope.twitterError = true;
            });
            return;
        } else {
            social.linkTwitterUser(twitterSuccess, function(err) {
                keenIO.addEvent('twitterLink', {
                  user: auth.getUser()._id,
                  bar: auth.getUser().barId,
                  result: 'error',
                  error: err
                })

                console.log("Error linking Twitter", err);
                scope.twitterError = true;
            });
            return;
        }
    };

    scope.unlinkTwitter = function() {
      cordovaService.dialogs.confirm(
        'Unlink Twitter account?', 'Are you sure that you want to unlink your Twitter account?',
        function() {
          var unlinkTwitterPromise = api.delete("twitter/deactivate");
          unlinkTwitterPromise.success(function(data, status, headers, config) {
            keenIO.addEvent('twitterUnLink', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              result: 'success'
            })

            scope.twitterSuccess = false;
          });

          unlinkTwitterPromise.error(function(data, status, headers, config) {
            keenIO.addEvent('twitterUnLink', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              result: 'error',
              error: data
            })
            
            modal.open({
              url: "views/modals/error_message.html",
              cls: "fade-in",
              init: {
                errorMessage: 'Something has gone wrong - please try again later.'
              }
            });
          });
        },
        null
      )
    }

    function fbSuccess(data) {
        modal.open({
            url: "views/modals/feedback_message.html",
            init: {
                feedbackMessage: "Facebook account successfully linked."
            },
            cls: "fade-in"
        });

        scope.fbSuccess = true;
        scope.fbError = false;
    };

    function twitterSuccess(data) {
        modal.open({
            url: "views/modals/feedback_message.html",
            init: {
                feedbackMessage: "Twitter account successfully linked."
            },
            cls: "fade-in"
        });

        scope.twitterSuccess = true;
        scope.twitterError = false;
    };

    function showModal(errorMessage) {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: errorMessage
        }
      });
    };

    function validPassword() {
      if(scope.tempUser.password) {
        if(scope.tempUser.password == scope.tempUser.passwordConfirm) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    };

    function feedback() {
      if(scope.myProfileForm.password.$invalid){
        scope.tempUser.password = null;
        scope.tempUser.passwordConfirm = null;
        showModal("Password must be at least eight characters, contain one capital letter, and one number.");
        return;
      }

      if(scope.myProfileForm.passwordConfirm.$invalid){
        scope.tempUser.password = null;
        scope.tempUser.passwordConfirm = null;
        showModal("Password must be at least eight characters, contain one capital letter, and one number.");
        return;
      }

      if(scope.tempUser.password !== scope.tempUser.passwordConfirm) {
        showModal("Passwords do not match.");
        return;
      }

      if(scope.myProfileForm.zipcode.$invalid) {
        showModal("Zipcodes must be 5 digits in length and cannot contain any letters or special characters.");
        return;
      }
    };

    scope.goToSurvey = function(){
      state.go("Main.Profile.Survey");
    }

  }
]);
