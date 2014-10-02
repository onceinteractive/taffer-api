angular.module('appControllers')
	.controller('ctrlSearch', ['$routeParams', '$rootScope','$scope', '$http', '$location', '$window', function ($routeParams, $rootScope, $scope, $http, $location, $window) {
		$scope.Results = {};
		$scope.searchOptions = {};

		//Array of dropdown values on search by
		$scope.$watch('searchType', function() {
			if ($scope.searchType == "users") {
				$scope.searchOptions =[
				      {name:'Firstname', value:'firstName'},
				      {name:'Lastname', value:'lastName'},
				      {name:'Email Address', value:'email'},
				    ];
			 }
			if ($scope.searchType == "bar") {
				$scope.searchOptions =[
				      {name:'Code', value:'code'},
				      {name:'Zipcode', value:'zipcode'},
				      {name:'City', value:'city'},
				      {name:'State Code', value:'state'},
				    ];
			}
		});

		$scope.doSearch = function() {
			//check for blank fields. then process search.
			if ($scope.searchType && $scope.searchFor && $scope.searchQuery) {
				$http.get($scope.searchType + '?' + $scope.searchFor.value + '=' + $scope.searchQuery, {
				}).success(function(data) {
					console.log(data)
					$scope.Results = data;

					//Reset values on new search.
					$scope.userResults = false;
					$scope.barResults = false;
					$scope.noResults == false;

					//Define which div should be shown
					if (data) $scope.noResults == true;
					if ($scope.searchType == "users") $scope.userResults = true;
					if ($scope.searchType == "bar") $scope.barResults = true;
				})
			}else{
				alert("Please fill in all fields.")
			}
		}
	}]);