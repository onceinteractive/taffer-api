angular.module("taffer.controllers")
.controller("PartenderVideoCtrl", [
	"$scope",
	"$ocModal",
	function(scope, modal) {
		scope.isPaused = false;
		scope.video = $('#m-partender-video')[0];

		scope.videoEnd = function() {
			modal.close('partenderModal');
			modal.open({
				id: "partenderTrial",
				url: "views/modals/partender_trial.html",
				cls: "fade-in partender-trial-text",
				controller: 'PartenderDealCtrl'
			});
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
