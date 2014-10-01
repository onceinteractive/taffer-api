angular.module('appControllers')
	.controller('viewAdmin', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
	
	var loadAdminData = function(adminID) {
		$http.get('admins/' + adminID, { 
			}).success(function(data) {
				$scope.adminData = data;

				//now grab permissions
				$http.get('permissions/admins', { 
				}).success(function(data) {
					console.log(data);
					$scope.permissions = data;

					//if admin doesn't have any current permissions, create valid object.
					if ($scope.adminData.permissions == undefined) $scope.adminData.permissions={}

					//load admin current objects into checkboxes
					angular.forEach($scope.permissions, function(value, key) {

						if ($scope.adminData.permissions[key] == undefined){
							console.log($scope.adminData.permissions)
						}

						if ($scope.adminData.permissions[key] == undefined){
							$scope.adminData.permissions[key] = {}
							angular.forEach(value, function(subvalue, subkey) {
								$scope.adminData.permissions[key][subkey] = false;
							});
						} else {
							angular.forEach(value, function(subvalue, subkey) {
								if ($scope.adminData.permissions[key][subkey] == undefined) {
									$scope.adminData.permissions[key][subkey] = false;
								}
							})
						}
					});
				})

		}).error(function(data) {
			//handle errors
		})
	}

	$scope.updateAdmin = function() {

		$errorMessage = "Please fill in all fields";
		filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

		if (!filter.test($scope.adminData.email)) $errorMessage = "Invalid email address";
		if (filter.test($scope.adminData.email) && $scope.adminData.firstName && $scope.adminData.lastName && $scope.adminData.email) {
			$scope.updatedText = "Processing changes...";		
			//send data to backend
			$http.put('admins/' + $routeParams.adminID, {
				'firstName':$scope.adminData.firstName,
				'lastName':$scope.adminData.lastName,
				'email':$scope.adminData.email,
				'password':$scope.adminData.password,
				'locked':$scope.adminData.locked,
				'permissions':$scope.adminData.permissions,
			}).success(function(data) {
				if (data._id) $scope.updatedText = "Account changes have been saved!";
			}).error(function(data) {
				$scope.updatedText = "Error processing request.";
			})

		}else{
			alert($errorMessage)
		}
	}

	//trigger load function
	loadAdminData($routeParams.adminID);

}]);