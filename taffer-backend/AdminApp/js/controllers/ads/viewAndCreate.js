angular.module('appControllers')
	.controller('viewAndCreateAdCtrl', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
	
	// Populate $scope.objects with static values
	$scope.states = {};
	var states = [ 
		"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", 
		"NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY" 
				];
	states.forEach(function(state) {
		$scope.states[state] = false;
	});

	$scope.allTypes = ["small", "large"];

	// watch allStates checkbox to quickly select/deselect all states
	$scope.$watch('allStates', function(){
		if ($scope.allStates === true) {
			for (var key in $scope.states) {
				$scope.states[key] = true;
			}
		} else if ($scope.allStates === false) {
			for (var key in $scope.states) {
				$scope.states[key] = false;
			}
		}
	});

	$scope.getAds = function() {
		$scope.Results = [];
		$http.get('ads', {}).success(function(ads){
			$scope.adResults = true;
			if($scope.searchType) {
				ads.forEach(function(ad){
					if (ad.type === $scope.searchType) {
						$scope.Results.push(ad);
					}
				})
			} else {
				$scope.Results = ads;
			}
		});
	}

	//FOR AD.CREATE
	$scope.createAd = function() {
		if ($scope.images && $scope.states && $scope.type){

			//initialize states array and fill it with selected states
			var states = [];
			for (var state in $scope.states) {
				if ($scope.states[state] === true) {
					states.push(state);
				}
			}
			// use formData api to append post object with images from fileInput directive
			var fd = new FormData();
			angular.forEach($scope.images, function(file) {
				fd.append("image", file);
			});
			fd.append("states", states);
			fd.append("type", $scope.type);
			// POST
			post(fd);
		} else {
			alert("Please fill all fields");
		}
	}

	var post = function(fd) {
		// for each new search make sure finished is null (to hide final message)
		$scope.finished = null;
		// post the formData post object, with the magical angular instructions so that
		// it works correctly
		$http.post('ads', fd, {
			transformRequest: angular.identity,
			headers:{'Content-Type':undefined}
		})
		.success(function(data) {
			$scope.finished = "Successfully created the Ad!";
		})
		.error(function(data, status) {
			$scope.finished = "Sorry, there was an error creating the Ad."
		})
		$scope.type = null;
		$scope.image = null;
	}
}]);