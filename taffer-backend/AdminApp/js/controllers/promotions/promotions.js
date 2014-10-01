angular.module('appControllers')
	.controller("promotionsCtrl", ["$routeParams","$scope","$http","$location", "utility", function($routeParams, $scope, $http, $location, utility) {
	var statics = {
		areas: ["West","Mid","East"],
		categories: ["Casino", "Casual Dining", "Diner", "Fine Dining", "Lounge", "Night Club", "Pool Hall", "Pub", "Pub/Tavern", "Restaurant", "Sports Bar", "Tavern"]
	};

	// $scope.promotion is the important variable for this controller.  
	// If the user is at the create page it will be populated with static values.
	// If the user is updating, the promotion object will be populated with the values from the chosen promotion

	$scope.promotion = {};

	//RELEVANT TO CREATE PROMOTION ONLY:

	// load promotion area and categories objects from statics (all set to false to start)
	if ($location.path() === "/createPromotion") {
		$scope.createView = true;
		$scope.promotion.areas = utility.loadObjFromArray(statics.areas, false);
		$scope.promotion.categories = utility.loadObjFromArray(statics.categories, false);
	}

	// the createPromotion function calls prepareForm and posts.
	$scope.createPromotion = function() {
		var fd = prepareForPost();
		if (fd) {
			$http.post('promotions', fd, {
				transformRequest: angular.identity,
				headers:{'Content-Type':undefined}		
			})
			.success(function(data){
				$scope.submitted = "Successfully created a new promotion!";
				$scope.finalView = true;
				$scope.createView = false;
				$scope.promotion = {};
			})
			.error(function(error){
				$scope.submitted = error;
			});
		}
	}

	// prepareForm() verifies that all manditory fields are fulfilled
	// Then it transforms the data given for each field and attaches them to a FormData instance appropriately.
	// It returns the prepared FormData instance

	var prepareForPost = function() {
		if (!$scope.promotion.title || !$scope.promotion.description || !$scope.promotion.areas || !$scope.promotion.categories || !$scope.promotion.socialImages) {
			alert("the promotion must have the following fields: title, description, areas, categories, image(s)");
			return;
		} else {
			var fd = new FormData();
			angular.forEach($scope.promotion, function(value, key){

				switch(key) {
					case "areas":
						fd.append(key, utility.objectToArray(value));
						break;
					case "categories":
						fd.append(key, utility.objectToArray(value));
						break;
					case "socialImages":
						angular.forEach(value, function(file){
							fd.append("images", file);
						});
						break;
					default:
						fd.append(key, value);
				}
			});
			return fd;
		}
	}

	// RELEVANT TO CREATE PROMOTION AND VIEW/UPDATE PROMOTION

	// watch the "all" checkboxes to quickly select/deselect all possible choices for categories and areas
	$scope.$watch('allAreas', function(){
		if ($scope.allAreas === true) {
			for (var key in $scope.promotion.areas) {
				$scope.promotion.areas[key] = true;
			}
		} else if ($scope.allAreas === false) {
			for (var key in $scope.promotion.areas) {
				$scope.promotion.areas[key] = false;
			}
		}
	});

	$scope.$watch('allCategories', function(){
		if ($scope.allCategories === true) {
			for (var key in $scope.promotion.categories) {
				$scope.promotion.categories[key] = true;
			}
		} else if ($scope.allCategories === false) {
			for (var key in $scope.promotion.categories) {
				$scope.promotion.categories[key] = false;
			}
		}
	});

	$scope.addCategory = function() {
		if (!$scope.newCategory || $scope.newCategory === ""){
			alert("You must provide a category");
			$scope.newCategory = "";
			return;
		} else {
			$scope.promotion.categories[$scope.newCategory] = true;
			$scope.apply;
			$scope.newCategory = "";
		}
	}

	//RELEVANT TO VIEW/UPDATE PROMOTIONS ONLY

	// getPromotions() requests all of the promotions, and if a filterDate is provided, filters the data set
	// by promotions in which the filterDate falls within the range of the promotion's startDate and endDate

	$scope.viewView = true;

	$scope.imagePrefix = utility.imagePrefix;

	$scope.getPromotions = function(){
		$scope.promotionResults = [];
		$http.get('promotions', {})
			.success(function(data){
				if (data) {
					if ($scope.filterDate){
						angular.forEach(data, function(promotion){
							if (promotion.startDate <= $scope.filterDate && promotion.endDate >= $scope.filterDate){
								$scope.promotionResults.push(promotion);
							}
						});
					} else {
						$scope.promotionResults = data;
					}
				}
				$scope.didFilter = true;
			})
			.error(function(error){
				$scope.error = error;
			})
	}

	// clicking on a viewable promotion from the view.html template calls this function.
	// it hides the "view" aspect of the template and shows a view similar to the create.html view
	// except the fields are populated by the selected promotion's data.

	$scope.viewPromotion = function(id) {
		$scope.promotionResults.forEach(function(promotion) {
			if(promotion._id === id){
				$scope.promotion = promotion;
			}
		});
		if (!$scope.promotion.categories){
			$scope.promotion.categories = [];
		}
		if (!$scope.promotion.areas){
			$scope.promotion.areas = [];
		}
		$scope.promotion.categories = utility.loadObjFromArray($scope.promotion.categories, true);
		$scope.promotion.areas = utility.arrayToObject($scope.promotion.areas, statics.areas);
		$scope.viewView = false;
		$scope.updateView = true;
	}

	// backToView() hides the UPDATE view and shows the VIEW, while clearing the set of results.
	$scope.backToView = function(){
		$scope.updateView = false;
		$scope.finalView = false;
		$scope.viewView = true;
		$scope.didFilter = false;
		$scope.submitted = null;
		$scope.promotionResults = [];
		$scope.promotion = {};
	}

	// updatePromotion will be very similar to createPromotion() except that it will request a PUT
	// to a route that includes the promotion's id as a parameter.

	$scope.updatePromotion = function() {
		if (!$scope.promotion.title || !$scope.promotion.description || !$scope.promotion.areas || !$scope.promotion.categories || !($scope.promotion.socialImages || $scope.promotion.newSocialImages)) {
			alert("the promotion must have the following fields: title, description, areas, categories, image(s)");
		} else {
			// call prepareForPut which returns fd object as the formdata param to the put request.
			$http.put('promotions/' + $scope.promotion._id, prepareForPut(), {
				transformRequest: angular.identity,
				headers:{'Content-Type':undefined}
			})
			.success(function(data){
				$scope.submitted = "Successfully updated the promotion!";
				$scope.finalView = true;
				$scope.updateView = false;
				$scope.promotion = {};
			})
			.error(function(error){
				$scope.submitted = "There was an error updating the promotion.";
				console.log(error);
			})
		}
	}

	var prepareForPut = function() {
		var fd = new FormData();
		fd.append("title", $scope.promotion.title);
		fd.append("description", $scope.promotion.description);
		fd.append("areas", utility.objectToArray($scope.promotion.areas));
		fd.append("categories", utility.objectToArray($scope.promotion.categories));
		if ($scope.promotion.newStartDate){
			console.log("new Start Date: " + $scope.promotion.newStartDate);
			fd.append("startDate", $scope.promotion.newStartDate);
		} else if ($scope.promotion.startDate) {
			console.log("Start Date: " + $scope.promotion.startDate);
			fd.append("startDate", $scope.promotion.startDate);
		}
		if ($scope.promotion.newEndDate){
			fd.append("endDate", $scope.promotion.newEndDate);
		} else if ($scope.promotion.endDate) {
			fd.append("endDate", $scope.promotion.endDate);
		}
		if ($scope.promotion.newSocialImages){
			angular.forEach($scope.promotion.newSocialImages, function(image){
				fd.append("images", image);
			});
		} else {
			fd.append("socialImages", $scope.promotion.socialImages);
		}
		fd.append("custom", $scope.promotion.custom);
		fd.append("sponsored", $scope.promotion.sponsored);

		return fd;
	}
}]);