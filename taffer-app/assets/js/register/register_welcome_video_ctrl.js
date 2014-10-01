angular.module("taffer.controllers")
.controller("WelcomeVideoCtrl", [
	"$scope",
	"$ocModal",
	function(scope, modal) {
		scope.isPaused = false;
		scope.video = $('#m-welcome-video')[0];

		scope.videoEnd = function() {
			modal.close();
		};

		scope.play = function() {
			scope.isPaused = false;
			scope.video.play();
		};

		scope.pause = function() {
			scope.isPaused = true;
			scope.video.pause();
		};

		scope.$on("app-resume", function() {
			if(scope.video.paused) {
				scope.isPaused = true;
				scope.$apply();
			} else {
				scope.isPaused = false;
				scope.$apply();
			}
		});
	}
]);
