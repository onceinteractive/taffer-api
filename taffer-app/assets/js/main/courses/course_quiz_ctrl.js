angular.module("taffer.controllers")
.controller("CourseQuizCtrl", [
  "$scope",
  "$state",
  "$ocModal",
  "CourseService",
  "AuthService",
  "KeenIO",
  function(scope, state, modal, courseService, auth, keenIO) {
    scope.score = 0;

    scope.correct = false;
    scope.wrong = false;
    scope.submitted = false;
    scope.answerSelected = false;
    scope.goNext = false;
    scope.finished = false;

    scope.activeQuestion = 1;
    scope.questions = scope.selectedCourse.quiz;
    scope.question = scope.questions[
      scope.activeQuestion -1
    ];
    scope.questionOptions = [];
    scope.selectedAnswer = null;

    (function(){
      getOptions();
    })()

    scope.cancel = function() {
      scope.questions = [];
      scope.questionOptions = [];
      state.go("Main.Courses.Details");
    };

    scope.setAnswer = function(option) {
      if(!scope.submitted) {
        scope.answerSelected = true;
        scope.selectedAnswer = option;
      }
    };

    scope.$watch('submitted', function() {
      if(scope.submitted) {
        scope.inputDisabled = true;
      } else {
        scope.inputDisabled = false;
      }
    });

    scope.next = function() {
      scope.selectedAnswer = null;
      scope.submitted = false;
      scope.goNext = false;
      scope.wrong = false;
      scope.correct = false;
      scope.activeQuestion++;
      getCurrentQuestion();
      getOptions();
      cleanInputs();
    };

    scope.finish = function() {
      scope.updateCompletedCourse(scope.selectedCourse);
      if(scope.score >= 2) {
        scope.selectedCourse.complete = true;
        courseService.update(scope.selectedCourse._id, {complete: true})
          .then(function(data) {

            keenIO.addEvent('coursesQuizFinish', {
              user: auth.getUser()._id,
              bar: auth.getUser().barId,
              course: scope.selectedCourse._id,
              score: scope.score
            })

            if(data.badges && data.badges.length > 0) {
              modal.open({
                url: "views/modals/course_completion.html",
                cls: "fade-in l-badge-modal",
                init: {
                  badgeImageKey: data.badges[0].imageKey
                },
                onClose: function() {
                  shareCourse();
                }
              });
            } else {
              shareCourse();
            }

          }, function(error) {
            console.log(error);
            shareCourse();
          });
      } else {
        shareCourse();
      }
    };

    scope.submitAnswer = function() {
      scope.answerSelected = false;
      scope.submitted = true;

      if(scope.selectedAnswer == scope.question.correctAnswer) {
        scope.wrong = false;
        scope.correct = true;
        scope.score += 1;
      } else {
        scope.wrong = true;
        scope.correct = false;
      }

      if(scope.activeQuestion < scope.questions.length) {
        scope.goNext = true;
      } else {
        scope.finished = true;
      }
    };

    scope.share = function() {
      modal.close();
      state.go("Main.Courses.Details", {share: true});
    };

    function shareCourse() {
      if(auth.hasPermission("courses", "share")) {
        modal.open({
          url: "views/modals/course_share.html",
          cls: "fade-in l-badge-modal",
          onClose: function() {
            state.go("Main.Courses.Details");
          },
          init: {
            share: scope.share
          }
        });
      } else {
          if(scope.score >= 2) {
              state.go("Main.Courses.Details");
          } else {
            modal.open({
                url: "views/modals/feedback_message.html",
                cls: "fade-in",
                onClose: function() {
                    state.go("Main.Courses.Details");
                },
                init: {
                    feedbackMessage: "Unfortunately, you did not pass the course.  You can always watch the video and take the course again."
                }
            });
          }
      }

    };

    // Combines and shuffles question options
    function getOptions() {
      var options = angular.copy(scope.question.wrongAnswers);
      options.push(scope.question.correctAnswer);
      scope.questionOptions = shuffle(options);
    };

    // Cleans radio buttons on next
    function cleanInputs() {
      // This is hacky. We should use ng-model
      var inputs = $("input[name='questionButton']");
      for(var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].checked = false;
      }
    };

    // Get active question
    function getCurrentQuestion() {
      current = scope.questions[
        scope.activeQuestion - 1
      ];

      scope.question = current;
    };

    // Randomize the array
    function shuffle(o){
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

  }
]);
