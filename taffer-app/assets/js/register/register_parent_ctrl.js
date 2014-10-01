angular.module("taffer.controllers")
.controller("RegisterParentCtrl", [
	"$scope",
	"$state",
	"api",
	function(scope, state, api) {
		// Objects that will be built up during the registration process
		scope.user = {};
		scope.bar = {};
		scope.selected = "";

		scope.showBack = true

		// Move throughout registration
		scope.next = function() {
			scope.$broadcast("reg-next");
		};
		scope.back = function() {
			scope.$broadcast("reg-back");
		};
		scope.finish = function() {
			scope.$broadcast("reg-finish");
		};

		scope.$on("hideBack", function(event) {
			scope.showBack = false
		});

		scope.$on("showBack", function(event){
			scope.showBack = true
		})

		// When Resuming, get user and bar info for logged in user
		scope.retrieveUser = function() {
			var promise = api.get("users");
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					scope.user = data;
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};
		scope.retrieveBar = function() {
			var promise = api.get("bar");
			promise.success(function(data, status, headers, config) {
				if(status === 200) {
					scope.bar = data;
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

		// Handle special states for logo, nav, and breadcrumbs
		scope.shouldHideLogo = function() {
			var name = state.current.name;
			if(name == "Registration.QuestionsIntro" ||
				name == "Registration.BarQuestions" ||
				name == "Registration.AdminProfile" ||
				name == "Registration.TMProfile") {
				return true;
			}
			return false;
		};
		scope.shouldShowFinish = function() {
			var name = state.current.name;
			if(name == "Registration.AdminProfile" ||
				name == "Registration.TMProfile") {
				return true;
			}
			return false;
		};
		scope.shouldHideNext = function() {
			var name = state.current.name;
			if(name == "Registration.BarID") {
				return true;
			}
			return false;
		};
		scope.isCrumbSelected = function(num) {
			var name = state.current.name;
			switch(num) {
				case 1:
					if(name == "Registration.BasicInfo") return true;
					break;
				case 2:
					if(name == "Registration.BarID") return true;
					break;
				case 3:
					if(name == "Registration.BarInfo" ||
						name == "Registration.TMProfile") return true;
					break;
				case 4:
					if(name == "Registration.BarQuestions" || name == "Registration.QuestionsIntro") return true;
					break;
				case 5:
					if(name == "Registration.AdminProfile") return true;
					break;
				default:
					return false;
					break;
			}
		};
		scope.showLastCrumbs = function() {
			var name = state.current.name;
			switch(name) {
				case "Registration.BarInfo":
					return true;
					break;
				case "Registration.QuestionsIntro":
					return true;
					break;
				case "Registration.BarQuestions":
					return true;
					break;
				case "Registration.AdminProfile":
					return true;
					break;
				default:
					return false;
					break;
			}
		};

		// Functions for easily updating parent scope
		scope.updateParentUser = function(user) {
			console.log(user);
			scope.user = user;
			console.log(scope.user);
		};

		scope.updateParentBar = function(bar) {
			console.log(bar);
			scope.bar = bar;
			console.log(scope.bar);
		};
	}
]);
