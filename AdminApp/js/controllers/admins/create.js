angular.module('appControllers')
	.controller('createAdmin', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
		$scope.adminData = {};


		//create admin function 
		//*******still need to check for duplicate emails + add email validation
		$scope.createAdmin = function() {
			filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

			$errorMessage = "Please fill in all fields";
			if (!filter.test($scope.adminData.email)) $errorMessage = "Invalid email address";

			if (filter.test($scope.adminData.email) && $scope.adminData.firstName && $scope.adminData.lastName && $scope.adminData.email) {
				$scope.resText = "Creating account...";
				$http.post('admins/', {
					'firstName':$scope.adminData.firstName,
					'lastName':$scope.adminData.lastName,
					'email':$scope.adminData.email,
					'password':$scope.adminData.password,

				}).success(function(data) {
					if (data._id) $scope.updatedText = "Account created";
				}).error(function(data) {
					$scope.resText = "Error processing request.";
				})
			}else{
				alert($errorMessage)
			}
		}

	}]);