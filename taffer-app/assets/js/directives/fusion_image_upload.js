angular.module("taffer.directives")
.directive("fmImageUpload", [
	"$ocModal",
	"cordovaService",
	function(modal, cs) {
		return {
			restrict: "A",
			scope: {
				ngModel: "=",
				onSuccess: "&"
			},
			link: function(scope, elem, attr) {
				function success(result) {
					var uri = "data:image/jpeg;base64," + result;
					scope.ngModel = uri;
					scope.$apply();

					if(scope.onSuccess) {
						scope.onSuccess({uri: uri});
					}
				};

				function error(err) {
					modal.open({
						url: "views/modals/feedback_message.html",
						cls: "fade-in",
						init: {
							feedbackMessage: "Couldn't Get Photo"
						}
					});
				};

				function getPicture(source) {
					var sourceType;
					if(source == "camera") {
						sourceType = Camera.PictureSourceType.CAMERA;
					} else {
						sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
					}

					cs.camera.getPicture(success, error, {
						destinationType: Camera.DestinationType.DATA_URL,
						sourceType: sourceType,
						correctOrientation: true
					});
				};

				elem.click(function() {
					modal.open({
						url: "views/modals/image_upload.html",
						controller: "ImageUploadCtrl",
						cls: "fade-in",
						init: {
							getPicture: getPicture
						}
					});
				});
			}
		};
	}
]);
