angular.module("taffer.controllers")
.controller("ProfileSurveyCtrl", [
	"$scope",
	"$state",
	"api",
	"$ocModal",
	"questions",
	function(scope, state, api, modal, questions) {
		if(questions.status == 200){
			scope.questions = questions.data
		} else {
			state.go("Main.Profile");
			return
		}

		if(!scope.questions || scope.questions == []){
			state.go("Main.Profile");
			return
		}

		scope.activeQuestion = 1;
		// scope.questions = questions;
		scope.question = scope.questions[
			scope.activeQuestion -1
		];
		scope.answers = {}

		scope.showNext = true
		
		scope.questions.forEach(function(question){
			scope.answers[question._id] = question.answers
		})

		if(scope.previousAnswers && scope.preciousAnswers.length > 0){
			scope.previousAnswers.forEach(function(previousAnswer){
				var copy = previousAnswer
				delete copy.question
				scope.savedAnswers.push(previousAnswer)
			})
		}

		// Handle Next and Back Button Clicks
		scope.next = function() {
			if(!scope.validate()){
				return
			}

			scope.showBack = true

			scope.activeQuestion++;
			getCurrentQuestion();

			if(scope.activeQuestion >= scope.questions.length){
				scope.showNext = false
			}
			
		}

		scope.back = function() {
			scope.showNext = true
			if(scope.activeQuestion > 1) {
				scope.activeQuestion--;
				getCurrentQuestion();
				if(scope.activeQuestion == 1){
					scope.showBack = false
				}
			} else {
				state.go("Main.Profile");
			}
		}

		scope.validate = function(){
			if(scope.questions[scope.activeQuestion-1].type == 'percentage'){
				var totalPercentage = 0,
					negativeValue
				Object.keys(scope.answers[scope.question._id]).forEach(function(option){
					if(scope.answers[scope.question._id][option]){
						if(scope.answers[scope.question._id][option]){
							if(typeof scope.answers[scope.question._id][option] == 'string') {
								scope.answers[scope.question._id][option] = scope.answers[scope.question._id][option].replace(/[^0-9]/g, "")
							}

							if(scope.answers[scope.question._id][option] < 0){
								negativeValue = true
							}
						}

						totalPercentage += parseInt(scope.answers[scope.question._id][option])
						scope.answers[scope.question._id][option] = parseInt(scope.answers[scope.question._id][option])
					}
				})
				console.log(totalPercentage)

				if(totalPercentage == 0){
					return true
				}

				if(negativeValue){
					modal.open({
		              url: "views/modals/error_message.html",
		              cls: "fade-in",
		              init: {
		                errorMessage: "The percentage entered cannot be a negative number."
		              }
		            });
		            return false
				} else if(totalPercentage > 100){
					modal.open({
		              url: "views/modals/error_message.html",
		              cls: "fade-in",
		              init: {
		                errorMessage: "The total percentage can't be over 100%."
		              }
		            });
		            return false
				} else if(totalPercentage < 100){
					modal.open({
		              url: "views/modals/error_message.html",
		              cls: "fade-in",
		              init: {
		                errorMessage: "The total percentage can't be under 100%."
		              }
		            });
		            return false
				} else {
					return true
				}
			} else {
				return true
			}
		}

		scope.skip = function() {
			state.go("Registration.AdminProfile");
		}

		// Get active question
		function getCurrentQuestion() {
			current = scope.questions[
				scope.activeQuestion - 1
			];

			scope.question = current;
		};

		scope.cancel = function(){
			state.go("Main.Profile");
		}

		scope.save = function(){
			var postData = []

			scope.questions.forEach(function(question){
				if(scope.answers[question._id]){
					postData.push({
						question: question._id,
						answers: scope.answers[question._id]
					})
				}
			})

			// scope.questions.forEach(function(question, index){
			// 	var saveAs = {
			// 		question: scope.question[index].question,
			// 		id: scope.question[index].id,

			// 	}

			// 	postData.push({
			// 		question: scope.questions[index].question,
			// 		answers: scope.savedAnswers[index]
			// 	})
			// })

			var promise = api.post('surveys', postData)
			promise.success(function(data, status, headers, config){
				console.log("Success saving questions")
			})
			promise.error(function(data, status, headers, config){
				console.log("Error saving questions - " + status + " - " + data)
			})
			state.go("Main.Profile");
	}

}]);
