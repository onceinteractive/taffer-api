angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Questions", {
			url: "/questions",
			views: {
				"questions": {
					templateUrl: "views/main/questions/questions.html",
					controller: "QuestionsCtrl",
					resolve: {
						QUESTIONS: ["api", function(api) {
							return api.get("questions");
						}]
					}
				}
			}
		})

		.state("Main.Questions.NewQuestion", {
			url: "/newQuestion",
			views: {
				"questions@Main": {
					templateUrl: "views/main/questions/new_question.html",
					controller: "NewQuestionCtrl"
				}
			}
		})

		.state("Main.Questions.View", {
			url: "/view?questionId",
			views: {
				"questions@Main": {
					templateUrl: "views/main/questions/view_question.html",
					controller: "ViewQuestionCtrl"
				}
			}
		});
	}
]);
