angular.module("taffer.controllers")
.controller("RegisterBasicInfoCtrl", [
	"$scope",
	"$state",
	"$stateParams",
	"$ocModal",
	"api",
	function(scope, state, params, modal, api) {
		// Show Modal
		if(!params.novideo) {
			modal.open({
				url: "views/modals/register_welcome_modal.html",
				controller: "WelcomeVideoCtrl",
				cls: "fade-in"
			});
		}

		// If the email and password have been entered on Login, pre populate
		if(params.email && params.password) {
			scope.user.email = params.email;
			scope.user.password = params.password;
			scope.user.confirm = params.password;
		}

		// Handle Next and Back Button Clicks
		scope.$on("reg-next", function(event) {
			scope.goNext();
		});

		scope.onGo = function() {
			if(event.which === 13) {
        scope.goNext();
      }
		}

		scope.goNext = function() {
			if(scope.registerBasic.$valid && scope.user.password == scope.user.confirm) {
				saveUser();
			} else {
				feedback();
			}
		};

		scope.$on("reg-back", function(event) {
			state.go("Login");
		});

		// Helper Functions
		function saveUser() {
			var promise = api.post("users", scope.user);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					scope.updateParentUser(data);
					scope.saveDeviceData();
					state.go("Registration.BarID");
				}
			});

			promise.error(function(data, status, headers, config) {
				if(status == 501){
					showModal("This e-mail address already has an account.");
				} else {
					showModal("Something went wrong on our end, please try again later.");
				}
			});
		};

		function feedback() {
			var message = "Please make sure all form fields are filled out.";
			if(scope.registerBasic.regBasicFirstName.$invalid){
				showModal("Please enter first name.");
				return;
			}

			if(scope.registerBasic.regBasicLastName.$invalid){
				showModal("Please enter last name.");
				return;
			}

			if(scope.registerBasic.regBasicEmail.$invalid){
				showModal("Please enter a valid email.");
				return;
			}

			if(scope.registerBasic.regBasicPassword.$invalid){
				showModal("Password must be at least eight characters, contain one uppercase letter, and contain one number.");
				return;
			}

			if(scope.registerBasic.regBasicConfirm.$invalid){
				showModal("Password must be at least eight characters, contain one uppercase letter, and contain one number.");
				return;
			}

			if(scope.user.password !== scope.user.confirm) {
				showModal("Passwords do not match.");
				return;
			}

			showModal(message);
			return;
		};

		function showModal(errorMessage) {
			modal.open({
				url: "views/modals/error_message.html",
				cls: "fade-in",
				init: {
					errorMessage: errorMessage
				}
			});
		};
	}
]);
