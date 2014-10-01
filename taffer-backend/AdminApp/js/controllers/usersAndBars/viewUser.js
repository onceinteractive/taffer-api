angular.module('appControllers')
	.controller('viewUser', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
	//load use data function
	var loadUserData = function(userID) {
		$http.get('users/' + userID, { 
			}).success(function(data) {
				$scope.userData = data;
				//so it doesn't change the password if nothing was entered.
				$scope.userData.password = null;

				//Grab permissions of user
				$http.get('permissions/users', { 
				}).success(function(data) {
					$scope.permissions = data;

					//if user doesn't have any current permissions, create valid object.
					if ($scope.userData.permissions == undefined) $scope.userData.permissions={}

					//Update object with all possible permissions
					//Load users current permissions values
					angular.forEach($scope.permissions, function(value, key) {
						if ($scope.userData.permissions[key] == undefined){
							$scope.userData.permissions[key] = {}
							angular.forEach(value, function(subvalue, subkey) {
								$scope.userData.permissions[key][subkey] = subvalue.defaultValue;
							});
						}
					});
				})
		})
	}
	
	//update user function
	$scope.updateUser = function() {
		filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		$errorMessage = "Please fill in all fields";
		if (!filter.test($scope.userData.email)) $errorMessage = "Invalid email address";
		if (filter.test($scope.userData.email) && $scope.userData.firstName && $scope.userData.lastName && $scope.userData.email) {
			
			$scope.updatedText = "Processing changes...";
			$http.put('users/' + $routeParams.userID, {
				'firstName':$scope.userData.firstName,
				'lastName':$scope.userData.lastName,
				'email':$scope.userData.email,
				'locked':$scope.userData.locked,
				'password':$scope.userData.password,
				'permissions':$scope.userData.permissions,
			}).success(function(data) {
				if (data._id) $scope.updatedText = "User changes have been saved!";
			}).error(function(data) {
				$scope.updatedText = "Error processing request.";
			})
		}else{
			alert($errorMessage)
		}
	}

	//Reset update text when scope vars have changed.
	$scope.$watch('userData', function() {
       $scope.updatedText = false;
       	console.log($scope.userData)
   	}, true);

	//load user data on load
	loadUserData($routeParams.userID);
}]);