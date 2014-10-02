angular.module('appControllers')
	.controller('updateAd', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {

	// SET UP
	$scope.states = {};
	$http.get('/ads/' + $routeParams.adID).success(function(ad){
		console.log(ad);
		$scope.type = ad.type;
		$scope.image = "https://s3.amazonaws.com/taffer-dev/" + ad.image;
		$scope.created = ad.created;
		var adStates = ad.states;
		var states = [ 
			"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", 
			"NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY" 
		];
		states.forEach(function(state) {
			if(adStates.indexOf(state) !== -1) {
				$scope.states[state] = true;
			} else {
				$scope.states[state] = false;
			}
		});
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

	//UPDATE FUNCTION
	$scope.updateAd = function() {
		$scope.finished = null;
		if ($scope.states && $scope.type){
			var states = [];
			for (var state in $scope.states) {
				if ($scope.states[state] === true) {
					states.push(state);
				}
			}
			// use FormData!
			var fd = new FormData();
			if ($scope.images){
				angular.forEach($scope.images, function(file) {
					fd.append("image", file);
				});
			}
			fd.append("states", states);
			fd.append("type", $scope.type);
			$http.put('/ads/' + $routeParams.adID, fd, {
				transformRequest: angular.identity,
				headers:{'Content-Type':undefined}
			})
			.success(function(data) {
				$scope.finished = "Successfully updated the Ad!";
			})
			.error(function(data, status) {
				$scope.finished = "Sorry, there was an error updating the Ad."
			});

		} else {
			alert("Please specify type and states.");
		}
	}
}]);