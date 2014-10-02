angular.module('appControllers')
	.controller('createTip', ['$scope', '$http', function ($scope, $http) {
	
	// Set Up:
	// Create $scope.barCategories, $scope.categories objects and populate them via http service
	$scope.barCategories = {};
	$scope.categories = {};

	$http.get('tips/categories', {}).success(function(categories) {
		categories.forEach(function(category){
			$scope.categories[category] = false;
		})
	});

	$http.get('bar/categoriesList', {}).success(function(barCategories) {
		console.log(barCategories);
		barCategories.forEach(function(barCategory){
			$scope.barCategories[barCategory] = false;
		});
	});

	// Watch allBarCategories to update form.barCategories easily
	$scope.$watch('allCategories', function() {
		if($scope.allCategories === true) {
			for (var key in $scope.categories) {
				$scope.categories[key] = true;
			}
		} else if ($scope.allCategories === false) {
			for (var key in $scope.categories) {
				$scope.categories[key] = false;
			}
		}
	});

	// Watch allCategories to update form.categories easily
	$scope.$watch('allBarCategories', function() {
		if($scope.allBarCategories === true) {
			for (var key in $scope.barCategories) {
				$scope.barCategories[key] = true;
			}
		} else if ($scope.allBarCategories === false) {
			for (var key in $scope.barCategories) {
				$scope.barCategories[key] = false;
			}
		}
	});


	$scope.createTip = function() {

		// initialize arrays for categories and barCategories
		var categories = [];
		var barCategories = [];

		// convert categories and barCategories objects to arrays
		for (var key in $scope.categories) {
			if ($scope.categories[key] === true) {
				categories.push(key);
			}
		}

		for (var key in $scope.barCategories) {
			if ($scope.barCategories[key] === true) {
				barCategories.push(key);
			}
		}

		// make sure we have at least one item in each array
		if (categories.length === 0 || barCategories.length === 0) {
			alert("Please pick at least one Category, and at least one Bar Category")
			return;
		}

		// then post to tips route and let the user know whether or not it was successful
		$http.post('tips', {
			title: $scope.title,
			tip: $scope.tip,
			categories: categories,
			barCategories: barCategories
		}).success(function(data) {
			if (data._id) {
				$scope.resText = "Successfully created tip!"
			}
		}).error(function(err) {
				$scope.resText = err;
		});
	}
}]);