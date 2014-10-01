angular.module("taffer.controllers")
.controller("ImageUploadCtrl", [
	"$scope",
	"$init",
	"$ocModal",
	function(scope, init, modal) {
		scope.fromCamera = function() {
			init.getPicture("camera");
			modal.close();
		};

		scope.fromLibrary = function() {
			init.getPicture("library");
			modal.close();
		};
	}
]);
