angular.module("taffer.controllers")
.controller("PartenderDealCtrl", [
	"$scope",
	"$ocModal",
	"cordovaService",
	function(scope, modal, cordovaService) {

		scope.goToPartender = function(){
			cordovaService.inAppBrowser.open("https://www.partender.com/",
				function(){}, function(){}, null, function(){})
			cordovaService.inAppBrowser.getCurrent().show()
		}

	}
]);
