angular.module('appControllers')
	.controller('ctrlHeader', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
	
	//Verify if user is logged in.
	$scope.$on('$locationChangeStart', function(event) {
		if($location.path() != "/login") {
			$http.get('admins/', { 
			}).success(function(data) {
					$scope.adminName = data.firstName;
					$scope.adminID = data._id;
			}).error(function(data) {
					$location.path('login')
			});
		}
	});

	//Logout function.
	$scope.doLogout = function() {
		$http.delete('login/', { 
		}).success(function(data) {
			$location.path("login");
		});
	}

	//My account link
	$scope.myAccount = function() {
		$location.path("/viewAdmin/" + $scope.adminID);
	}
}]);