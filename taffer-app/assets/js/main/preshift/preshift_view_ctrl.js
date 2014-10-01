angular.module("taffer.controllers")
.controller("PreshiftViewCtrl", [
  "$scope",
  "$state",
  "cordovaService",
  function(scope, state, cordovaService) {

    scope.$on("parent-back", function() {
      scope.updateSelectedMessage(null);
      state.go("Main.Preshift.List");
    });

    scope.viewImage = function() {
      var url = "http://s3.amazonaws.com/taffer-dev/" + scope.selectedMessage.image;
      cordovaService.inAppBrowser.open(url, null, null, null, function(){
        cordovaService.inAppBrowser.closeCurrent();
    }, null, "hidden=yes,location=no,toolbarposition=top,disallowoverscroll=yes,enableViewportScale=yes,transitionstyle=crossdissolve,allowInlineMediaPlayback=yes,clearcache=no");
      cordovaService.inAppBrowser.getCurrent().show();
    };

  }
]);
