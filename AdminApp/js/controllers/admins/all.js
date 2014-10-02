angular.module('appControllers')
	.controller('allAdmins', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
	
	//get all admins as object from backend.
	$http.get('admins/all', { 
		}).success(function(data) {
			$scope.Results = data;
	})
}]);