angular.module('appControllers')
	.controller('viewBar', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
		//Get bar data using barID
		$http.get('bar/' + $routeParams.barID, { 
			}).success(function(data) {
				console.log(data);
				$scope.barData = data;
		})

		//Get users related to this bar.
		$http.get('bar/' + $routeParams.barID + '/users', {
			}).success(function(data) {
				console.log(data)
				$scope.Results = data;
				if ($scope.searchType == "users") $scope.userResults = true;
			})
}]);