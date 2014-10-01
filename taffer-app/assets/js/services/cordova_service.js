angular.module("taffer.services")
.provider("cordovaService", function() {
	this.external = null;
	this.$get = [
		function() {
			var _this = this;
			var raw = {
				device: window.device,
				inAppBrowser: window.open,
				dialogs: window.navigator.notification,
				camera: window.navigator.camera,
				orientationLock: window.plugins ? window.plugins.orientationLock : "",
				screen: window.screen
			};

			var device = {
				isIOS: function() {
					if(!raw.device) return false;
					switch(this.getPlatform().toLowerCase()) {
						case "iphone":
						case "ios":
							return true;
							break;
						default:
							return false;
							break;
					}
				},

				isAndroid: function() {
					if(!raw.device) return false;
					return (this.getPlatform().toLowerCase() === "android");
				},

				getPlatform: function() {
					return raw.device ? raw.device.platform : "";
				},

				getModelName: function() {
					return raw.device ? raw.device.name : "";
				},

				getPhonegapVersion: function() {
					return raw.device ? raw.device.phonegap : "";
				},

				getUUID: function() {
					return raw.device ? raw.device.uuid : "";
				},

				getVersion: function() {
					return raw.device ? raw.device.version : "";
				}
			};

			var inAppBrowser = {
				open: function(url, startCB, stopCB, errorCB, exitCB, codeString, options) {
					var browserOptions = options ? options : "hidden=yes,location=yes,allowInlineMediaPlayback=yes,clearcache=no";
					_this.external = raw.inAppBrowser.call(window, url, "_blank", browserOptions);

					if(startCB) _this.external.addEventListener("loadstart", startCB);
					if(stopCB) _this.external.addEventListener("loadstop", stopCB);
					if(errorCB) _this.external.addEventListener("loaderror", errorCB);
					if(exitCB) _this.external.addEventListener("exit", exitCB);
				},

				closeCurrent: function() {
					if(_this.external) {
						_this.external.close();
					}
					_this.external = null;
				},

				getCurrent: function() {
					return _this.external;
				}
			};

			var dialogs = {
				confirm: function(message, subMessage, yesFunction, noFunction) {
					raw.dialogs.confirm.call(window, subMessage, function(result) {
						if(result === 1 && yesFunction) {
							yesFunction();
							return;
						}

						if(noFunction) {
							noFunction();
						}
					}, message);
				}
			};

			var camera = {
				getPicture: function(successCB, errorCB, userOptions) {
					var defaultOptions = {
						quality: 100,
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
						allowEdit: false,
						targetWidth: 550,
						targetHeight: 550,
						saveToPhotoAlbum: false
					};

					var options = $.extend({}, defaultOptions, userOptions);

					raw.camera.getPicture(successCB, errorCB, options);
				}
			};

			var orientation = {
				iosLandscape: function() {
					raw.screen.lockOrientation("landscape");
				},

				iosPortrait: function() {
					raw.screen.lockOrientation("portrait");
				},

				androidLandscape: function() {
					raw.orientationLock.lock("landscape");
				},

				androidPortrait: function() {
					raw.orientationLock.lock("portrait");
				}
			};

			return {
				raw: raw,
				device: device,
				inAppBrowser: inAppBrowser,
				dialogs: dialogs,
				camera: camera,
				orientation: orientation
			};
		}
	];
});
