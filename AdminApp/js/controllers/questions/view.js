angular.module('appControllers')
	.controller('viewQuestions', ["$routeParams", "$scope", "$http", "$location", "utility", function($routeParams, $scope, $http, $location, utility) {
		$scope.searchHappened = false;
		$scope.error = false;
		$scope.questionResults = [];
		$scope.getQuestions = function(){
			$http.get('questions', {})
				.success(function(questions){
					if (questions){
						if($scope.searchType){
							$scope.questionResults = questions[$scope.searchType];
						} else {
							$scope.questionResults = questions.open.concat(questions.answered);
						}
						$scope.searchHappened = true;
					} else {
						$scope.searchHappened = true;
					}
				})
				.error(function(error){
					$scope.error = true;
				})
		}
		$scope.imagePrefix = utility.imagePrefix;
	}]);