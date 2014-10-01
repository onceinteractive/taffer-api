angular.module("taffer.controllers")
.controller("ApprovalNeededCtrl", [
    "$scope",
	"$state",
	"$ocModal",
	"api",
	"cordovaService",
	"DataService",
	"spinner",
	function(scope, state, modal, api, cordovaService, dataService, spinner) {

		scope.logout = function() {
			var promise = api.delete("login");
			promise.success(function(data, status, headers, config) {
				console.log(localStorage.getItem("taffer_token"));
				localStorage.removeItem("taffer_token");
				console.log(localStorage.getItem("taffer_token"));

				spinner.start();
				dataService.removeAllData()[0].then(function() {
					cordovaService.inAppBrowser.open(
						"http://www.google.com",
						null,
						function() {
							spinner.stop();
							cordovaService.inAppBrowser.closeCurrent();
							state.go("Login");
						},
						function(err) {
							spinner.stop();
							state.go("Login");
						},
						null,
						null,
						"hidden=yes,clearcache=yes,allowInlineMediaPlayback=yes"
					);
				}, function(err) {
					spinner.stop();
					console.log(err);
				});
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
			});
		};

	}
]);
