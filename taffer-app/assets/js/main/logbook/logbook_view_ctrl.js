angular.module("taffer.controllers")
.controller("LogBookViewCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "cordovaService",
  "AuthService",
  "KeenIO",
  function(scope, state, params, api, cordovaService, auth, keenIO) {
    scope.reply = {
      message: "",
      imageKey: ""
    };

    (function() {
      if(scope.selectedLog) {
        if(scope.isSearching) {
          var promise = api.get("logbook/" + scope.selectedLog._id);
          promise.success(function(data, status, headers, config) {
            scope.thread = data;
          });

          promise.error(function(data, status, headers, config) {
            console.log(status);
            console.log(data);
          });
        } else {
          scope.thread = scope.selectedLog;
        }
      }
    })()

    scope.$on("parent-back", function(event) {
      state.go("Main.LogBook.List");
    });

    scope.scrollToBottom = function() {
      window.scrollTo(0, $(document).height() - $(window).height());
    };

    scope.shouldShowReplyButton = function() {
      if($(document).height() > $(window).height()) {
        return true;
      } else {
        return false;
      }
    };

    scope.viewImage = function(entry) {
      if(entry && entry.imageKey) {
        var url = "http://s3.amazonaws.com/taffer-dev/" + entry.imageKey;
        cordovaService.inAppBrowser.open(url, null, null, null, function(){
          cordovaService.inAppBrowser.closeCurrent();
      }, null, "hidden=yes,location=no,toolbarposition=top,disallowoverscroll=yes,enableViewportScale=yes,transitionstyle=crossdissolve,allowInlineMediaPlayback=yes,clearcache=no");
        cordovaService.inAppBrowser.getCurrent().show();
      }
    };

    scope.imageSuccess = function(result) {
        scope.reply.imageKey = result.uri;
        scope.$apply();
    };

    scope.saveReply = function() {
      if(scope.reply.message !== "") {
        var postData = { message: scope.reply.message };
        if(scope.reply.imageKey) {
            postData.image = scope.reply.imageKey;
        }

        var promise = api.post("logbook/" + scope.selectedLog._id, postData);
        promise.success(function(data, status, headers, config) {
          console.log(data);
          data.by = auth.getUser();
          scope.thread.entries.push(data);

          keenIO.addEvent('logbookReply', {
            user: auth.getUser()._id,
            bar: auth.getUser().barId,
            messageLength: scope.reply.message.length,
            image: scope.file ? true : false
          })

          scope.reply = {
            message: "",
            imageKey: ""
          };
          scope.file = "";
        });

        promise.error(function(data, status, headers, config) {
          console.log(status);
          console.log(data);
        });
      }
    };

  }
]);
