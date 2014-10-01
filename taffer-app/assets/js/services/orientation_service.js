angular.module("taffer.services")
.provider("OrientationService", function() {
	this.$get = [
		"cordovaService",
		function(cordova) {
			return {
				lockLandscape: function() {
					if(cordova.device.isIOS()) {
						cordova.orientation.iosLandscape();
					}

					if(cordova.device.isAndroid()) {
						cordova.orientation.androidLandscape();
					}
				},

				lockPortrait: function() {
					if(cordova.device.isIOS()) {
						cordova.orientation.iosPortrait();
					}

					if(cordova.device.isAndroid()) {
						cordova.orientation.androidPortrait();
					}
				}
			};
		}
	]
});
