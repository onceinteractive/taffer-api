angular.module('appControllers')
	.controller('viewCourses', ["$routeParams","$scope","$http","$location","utility", function($routeParams, $scope, $http, $location, utility) {
		
		$scope.imagePreview = utility.displayWithPrefix;

		$scope.viewView = true;
		
		$scope.getCourses = function(){
			$scope.courseResults = [];
			$http.get('courses', {})
				.success(function(courses) {
					if ($scope.filterTitle) {
						angular.forEach(courses, function(course){
							if (course.title.toLowerCase().indexOf($scope.filterTitle) !== -1){
								$scope.courseResults.push(course);
								console.log(course.title);
							}
						});
					} else {
						$scope.courseResults = courses;
					}
					$scope.didFilter = true;
					console.log($scope.courseResults);
				})
				.error(function(error){
					$scope.error = true;
					console.log(error);
				});
		}

		$scope.viewCourse = function(id) {
			// used to auto-populate bar categories checkboxes in create question form
			var barCategories;
			$http.get('bar/categoriesList', {})
				.success(function(barCategories) {
					$scope.courseResults.forEach(function(course) {
						if (course._id === id) {
							$scope.course = course;
						}
					});
					if (!$scope.course.categories){
						$scope.course.categories = [];
					}
					if (!$scope.course.quiz){
						$scope.course.quiz = [];
					}
					$scope.course.barCategories = utility.arrayToObject($scope.course.barCategories, barCategories);
					$scope.updateView = true;
					$scope.viewView = false;
				});
		}

		$scope.tempQuestion = {};
		$scope.tempQuestion.wrongAnswers = [];

		$scope.addWrongAnswerToQuestionForm = function(){
			// only do something if there is a wrong answer provided
			if($scope.tempWrongAnswer){
				// make sure the wrong answer doesn't already exist in the array (so as to not break ng-repeat)
				if($scope.tempQuestion.wrongAnswers.indexOf($scope.tempWrongAnswer) !== -1){
					alert("No repeats allowed");
					$scope.tempWrongAnswer = null;
					return;
				} else {
					$scope.tempQuestion.wrongAnswers.push($scope.tempWrongAnswer);
					$scope.tempWrongAnswer = null;
				}
			} else {
				alert("Please provide a wrong answer to add");
			}
		}

		$scope.addQuestionToQuizForm = function(){
			// make sure values are provided for all fields of question form
			if($scope.tempQuestion.question && $scope.tempQuestion.correctAnswer && ($scope.tempQuestion.wrongAnswers.length > 0)) {
				$scope.course.quiz.push($scope.tempQuestion);
				$scope.tempQuestion = {};
				$scope.tempQuestion.wrongAnswers = [];
			} else {
				alert("Please provide values for all new question fields");
			}
		}

		$scope.updateCourse = function() {
			console.log($scope.course);

            if(!$scope.course.title || !$scope.course.videoLink || !$scope.course.previewImage || !$scope.course.quiz || !$scope.course.barCategories ) {
                alert("Please fill in all required fields before submitting course.");
            } else {

            }



		}

	}]);