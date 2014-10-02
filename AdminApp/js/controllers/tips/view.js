angular.module('appControllers')
	.controller('viewTips', ['$scope', '$http', function ($scope, $http) {
	
	// First we get the categories to populate our dropdowns (we only use barCategories in the create template)
	$scope.categories = {};
	$http.get('tips/categories', {})
		.success(function(categories) {
			categories.forEach(function(category){
				$scope.categories[category] = false;
			});
		});

	// Set tipResults false until we have a search
	$scope.tipResults = false;

	// When we search, we generate a new Results array and populate it with the items that match the categories.
	// finally, we set tipResults to true, indicating that we have made a search
	$scope.getTips = function() {
		$scope.Results = [];
		$http.get('tips', {})
			.success(function(data) {
				if (data) {
					if ($scope.tipCategory){
						data.forEach(function(tip) {
							if (tip.categories.indexOf($scope.tipCategory) > -1 ) {
								$scope.Results.push(tip);
							}
						});
					} else {
						$scope.Results = data;
					}
				}
				$scope.tipResults = true;
			});
	}	
}]);