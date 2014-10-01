angular.module('appControllers')
	.controller('ctrlLogin', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
	$scope.loginStatus = "";
	$scope.login = {};

	//do this on submit
	$scope.doSubmit = function() {
		$scope.loginStatus = "Processing...";

		//Validate form fields.
		if (!$scope.login.email || !$scope.login.password) {
			$scope.loginStatus = "Please enter a email/password";
		}

		//Validation against backend
		$http.post('login', { 
				'email':$scope.login.email,
				'password':$scope.login.password,	

		}).success(function(data) {
			if(data._id && data.email) {
				$scope.loginStatus = "Thank you, please wait...";
				$location.path("/main");
			}
		}).error(function(data) {
			$scope.loginStatus = "Invalid Email/Password";
		})
	

	}

}]);