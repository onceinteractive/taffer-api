angular.module("taffer.controllers")
.controller("RegisterBarIDCtrl", [
	"$scope",
	"$state",
	"$stateParams",
	"$ocModal",
	"api",
	function(scope, state, params, modal, api) {
		// Are we resuming an incomplete registration?
		if(params.resuming) scope.retrieveUser();

		scope.message = "";

		scope.$emit("hideBack");

		// Open modal
		modal.open({
			url: "views/modals/register_welcome_2_modal.html",
			cls: "fade-in"
		});

		scope.enterBarId = function() {
			if(event.which === 13) {
        scope.submitBarID();
      }
		}

		// Handle Submit of Bar ID
		scope.submitBarID = function() {
			// Do somthing useful
			if(scope.regTMBarIDForm.$valid) {
				saveBar();
			} else {
				scope.message = "Invalid Bar ID Code"
			}
		};

		// Handle Next and Back Button Clicks
		scope.$on("reg-next", function(event) {
			console.log(scope.bar);
			if(scope.bar != {} && scope.user.role == "staff") {
				state.go("Registration.TMProfile");
			}
		});

		scope.$on("reg-back", function(event) {
			state.go("Registration.BasicInfo", {novideo: true});
		});

		// Helper Functions
		function saveBar() {
			var promise = api.post("register/bar/" + scope.barID);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentUser(data);
					updateBar();
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
				scope.message = "Error saving Bar ID Code";
			});
		};

		function updateBar() {
			var promise = api.get("bar/code/" + scope.barID);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentBar(data);
					saveTMUser();
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);

				scope.message = "Error associating bar to user";
			});
		};

		function saveTMUser() {
			scope.user.role = "staff";
			var promise = api.post("register/user", scope.user);
			promise.success(function(data, status, headers, config) {
				if(status == 200) {
					console.log(data);
					scope.updateParentUser(data);

					state.go("Registration.TMProfile");
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(status);
				console.log(data);
			});

		};
	}
]);
