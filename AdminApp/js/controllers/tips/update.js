angular.module('appControllers')
	.controller('updateTip', ['$routeParams','$scope', '$http', function ($routeParams, $scope, $http) {

	// Set Up:
	// Create $scope.barCategories, $scope.categories objects and populate them via http services
	$scope.barCategories = {};
	$scope.categories = {};

	var tipId;

	$http.get('tips/categories', {}).success(function(categories) {
		categories.forEach(function(category){
			$scope.categories[category] = false;
		});
	});

	$http.get('bar/categoriesList', {}).success(function(barCategories) {
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

	//TO UPDATE TIPS
	// get the individual tip we will be updating.
	$http.get('/tips/' + $routeParams.tipID).success(function(tip){
		console.log(tip);
		$scope.title = tip.title;
		$scope.tip = tip.tip;
		tipId = tip._id;
		for (var key in $scope.categories) {
			if (tip.categories.indexOf(key) != -1) {
				$scope.categories[key] = true;
			} else {
				$scope.categories[key] = false;
			}
		}
		for (var key in $scope.barCategories) {
			if (tip.barCategories.indexOf(key) != -1) {
				$scope.barCategories[key] = true;
			} else {
				$scope.barCategories[key] = false;
			}
		}
	})

	//UPDATE TIP
	$scope.updateTip = function() {

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

		$http.put('/tips/' + tipId, {
			title: $scope.title,
			tip: $scope.tip,
			categories: categories,
			barCategories: barCategories
		}).success(function(data) {
			$scope.resText = "Successfully updated tip!";
			console.log(data);
		}).error(function(error) {
			$scope.resText = error;
		})
	}
}]);