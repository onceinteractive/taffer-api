angular.module("taffer.controllers")
.controller("CourseDetailsCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "CourseService",
  "RECIPIENTS",
  "KeenIO",
  "AuthService",
  function(scope, state, params, api, courseService, RECIPIENTS, keenIO, auth) {
    scope.recipients = RECIPIENTS;
    scope.selectedRecipients = [];
    scope.showVideo = false;
    scope.hideVideo = false;
    scope.showShare = false;
    scope.showMessage = false;
    scope.selectAll = false;
    scope.isPaused = false;

    scope.videoElement = angular.element.find("#l-courses-video")[0];
    scope.videoContainer = angular.element.find("#l-course-video-container")[0];

    scope.message = null;

    if(scope.selectedCourse && scope.selectedCourse.message) {
      scope.showMessage = true;
      scope.message = scope.selectedCourse.message;
    }

    if(params.share == "true") {
      scope.showShare = true;
    }

    scope.$on("parent-back", function() {
      state.go("Main.Courses.List");
    });

    scope.play = function() {
        scope.showVideo = true;
        scope.isPaused = false;
        scope.videoElement.play();

        keenIO.addEvent('coursesVideoPlay', {
          user: auth.getUser()._id,
          bar: auth.getUser().barId,
          course: scope.selectedCourse._id
        })
    };

    scope.pause = function() {
        scope.isPaused = true;
        scope.videoElement.pause();
    };

    scope.skip = function() {
        scope.videoElement.pause();
        scope.showVideo = false;
    };

    scope.videoEnd = function() {
      scope.showVideo = false;
      scope.$apply();
    };

    scope.$on("app-resume", function() {
        if(scope.video.paused && scope.showVideo == true) {
            scope.isPaused = true;
            scope.$apply();
        } else {
            scope.isPaused = false;
            scope.$apply();
        }
    });

    scope.takeQuiz = function() {
      state.go("Main.Courses.Quiz");
    };

    scope.share = function() {
      scope.showShare = true;
    };

    scope.selectRecipient = function(recipient) {
      scope.selectAll = false;
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

    scope.deselectMembers = function() {
      if(scope.selectAll) {
        scope.selectdRecipients = [];
        scope.recipients.map(function(x) {
            scope.selectedRecipients.push(x);
        });
      } else {
        scope.selectedRecipients = [];
      }
    };

    scope.shareCourse = function() {
      getRecipientIds(function(recipientIds) {
        if(recipientIds.length > 0 && scope.message && scope.message !== "") {

          var obj = {
            users: recipientIds,
            message: scope.message
          }

          courseService.share(scope.selectedCourse._id, obj)
            .then(function(data) {
              keenIO.addEvent('coursesShare', {
                user: auth.getUser()._id,
                bar: auth.getUser().barId,
                recipients: recipientIds.length
              })

              scope.message = null;
              scope.selectedRecipients.length = 0;
              state.go("Main.Courses.List");

            }, function(error) {
              console.log(error);
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


  }
]);
