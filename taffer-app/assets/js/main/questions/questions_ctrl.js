angular.module("taffer.controllers")
.controller("QuestionsCtrl", [
  "$scope",
  "$state",
  "api",
  "QUESTIONS",
  function(scope, state, api, QUESTIONS) {
    scope.questions = QUESTIONS.data;

    scope.$on("parent-create", function() {
      state.go("Main.Questions.NewQuestion");
    });

    scope.viewQuestion = function(question) {
      state.go("Main.Questions.View", {questionId: question._id});
    }
  }
])
