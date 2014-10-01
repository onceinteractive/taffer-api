angular.module("taffer.controllers")
.controller("SponsorCtrl", [
  "$scope",
  "$stateParams",
  "$state",
  "$ocModal",
  "api",
  "cordovaService",
  function(scope, stateParams, state, modal, api, cordovaService) {
    scope.sponsoredContent = null;
    scope.contentText = '';

    if(stateParams.sponsorId) {
      var promise = api.get("ads/" + stateParams.sponsorId);
      promise.success(function(data, status, headers, config) {
        scope.sponsoredContent = data;
        scope.contentText = scope.sponsoredContent.description.replace(/\\n/g, '<br>');
      });

      promise.error(function(data, status, headers, config) {
        console.log(data)
        console.log(status);
      });
    } else {
      modal.open({
        url: "views/modals/error_message.html",
        cls: "fade-in",
        init: {
          errorMessage: "Could not retrieve sponsored content."
        },
        onClose: function(){
          state.go("Main.Landing");
        }
      });
    }

    scope.back = function() {
      state.go("Main.Landing");
    };

    scope.goToUrl = function() {
      cordovaService.inAppBrowser.open(scope.sponsoredContent.url, null, null, null, function(){
        cordovaService.inAppBrowser.closeCurrent();
    }, null, "hidden=yes,location=yes,toolbarposition=top,disallowoverscroll=yes,allowInlineMediaPlayback=yes,clearcache=no");
      cordovaService.inAppBrowser.getCurrent().show();
    };

  }
]);
