angular.module("taffer.controllers")
.controller("ThanksVideoCtrl", [
	"$scope",
	"$ocModal",
	function(scope, modal) {
		scope.isPaused = false;
		scope.video = $('#m-thank-you-video')[0];

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
