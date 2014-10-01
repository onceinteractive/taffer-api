angular.module("taffer.controllers")
.controller("RegisterBarInfoCtrl", [
	// Services
	"$scope",
	"$state",
	"$ocModal",
	"api",

	// Injected from state resolves
	"STATES",
	"CATEGORIES",
	"BAR",
	function(scope, state, modal, api, STATES, CATEGORIES, BAR) {
		// Assign states and categories to scope
		scope.states = STATES;
		scope.cats = CATEGORIES.data;

		if(BAR){
			scope.bar = BAR
		}

		// Handle Next and Back Button Clicks
		scope.$on("reg-next", function(event) {
			scope.goNext();
		});

		scope.$on("reg-back", function(event) {
			state.go("Registration.BarID");
		});

		scope.$emit("showBack");

		scope.onGo = function() {
			if(event.which === 13) {
        scope.goNext();
      }
		};

		scope.goNext = function() {
			if(scope.regAdminBarInfoForm.$valid) {
				saveAdminUser();
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoName.$invalid){
				showModal("You must enter a bar name.");
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoCat.$invalid) {
				showModal("You must select a category for your bar.");
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoAddr.$invalid) {
				showModal("You must enter an address for your bar.");
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoCity.$invalid) {
				showModal("You must enter the city in which your bar is located.");
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoState.$invalid) {
				showModal("You must select the state in which your bar is located.");
			} else if(scope.regAdminBarInfoForm.regAdminBarInfoZip.$invalid) {
				showModal("Your zipcode must contain 5 digits and cannot contain letters.");
			} else {
				showModal("Something is wrong with the information you've provided...");
			}
		};

		function showModal(message) {
			modal.open({
				url: "views/modals/error_message.html",
				cls: "fade-in",
				init: {
					errorMessage: message
				}
			});
		}

		// Helper Functions
		function saveAdminUser() {
			scope.user.role = "admin";
			var promise = api.post("register/user", scope.user);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentUser(data);

					saveBar();
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
			});
		};

		function saveBar() {
			var promise = api.post("bar", scope.bar);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentBar(data);

					associateBarToAdmin();
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);

				if(status == 403 && data.indexOf('User is already assigned to bar') != -1){

					var barUpdatePromise = api.put("bar", scope.bar)
					barUpdatePromise.success(function(data, status, headers, config){
						// scope.updateParentBar(data);
						state.go("Registration.QuestionsIntro");
					})

					barUpdatePromise.error(function(data, status, headers, config){
						console.log(data)
						console.log(status)
					})
				}
			});
		};

		function associateBarToAdmin() {
			scope.user.barId = scope.bar._id;
			var promise = api.post("register/user", scope.user);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentUser(data);

					state.go("Registration.QuestionsIntro");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
			});
		}
	}
]);
