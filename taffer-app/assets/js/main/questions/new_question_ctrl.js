angular.module("taffer.controllers")
.controller("NewQuestionCtrl", [
  "$scope",
  "$state",
  "$http",
  "$ocModal",
  "api",
  function(scope, state, http, modal, api) {
    scope.question = {
      question: ""
    }

    scope.cancel = function() {
      state.go("Main.Questions");
    }

    scope.submit = function() {
      if(scope.question.question !== "") {
        var promise = api.post("questions", scope.question);
        promise.success(function(data, status, headers, config) {
          modal.open({
            url: "views/modals/feedback_message.html",
            cls: "fade-in m-modal-feedback-large",
            init: {
              feedbackMessage: "Thanks! Your question has been submitted to Jon. Once your question is answered, you will receive an app notification."
            },
            onClose: function() {
              state.go("Main.Questions");
            }
          });
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
            errorMessage: "Please enter a question."
          }
        });
      }
    }
  }
])
