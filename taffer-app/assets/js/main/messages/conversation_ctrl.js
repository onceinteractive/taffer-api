angular.module("taffer.controllers")
.controller("ConversationCtrl", [
  "$scope",
  "$state",
  "$stateParams",
  "api",
  "cordovaService",
  "IntervalService",
  "MessageService",
  "KeenIO",
  "$timeout",
  function(scope, state, params, api, cordovaService, intervalService, messageService, keenIO, timeout) {
    scope.messageThread = null;
    scope.messages = [];
    scope.conversationTitle = "CONVERSATION";
    scope.newMessage = "";
    scope.file = null;
    scope.intervalId = null;
    scope.isDisabled = false;
    scope.totalImages = 0;
    scope.loadCounter = 0;

    // $timeout is called after angular manipulates the DOM
    // and after the browser has rendered the page
    // This is a good time to call scroll
    timeout(function() {
      // $(window).scrollTop($(document).height());
      window.scrollTo(0, document.documentElement.scrollHeight);
    }, 1000);

    (function() {
      if(params && (params.index || params.index == 0) ) {
        var msgThrd = scope.messageThreads[params.index];

        if(msgThrd) {
          if(msgThrd.participants.length > 1) {
            var peeps = [];
            msgThrd.participants.forEach(function(pax) {
              peeps.push(pax.firstName);
            });
            scope.conversationTitle = peeps.join(", ");
          } else if(msgThrd.participants.length > 0){
            var firstName = "";
            var lastName = "";
            if(msgThrd.participants[0].firstName) {
              firstName = msgThrd.participants[0].firstName.toUpperCase();
            }

            if(msgThrd.participants[0].lastName) {
              lastName = msgThrd.participants[0].lastName.toUpperCase();
            }

            scope.conversationTitle =  firstName + " " + lastName;
          } else if(msgThrd.participants.length == 0) {
            scope.conversationTitle = "Me"
          } else {
            state.go("Main.Messages.List");
          }

          getNumOfImages(msgThrd);

          flagMine(msgThrd, function(flaggedThread) {
            scope.messageThread = flaggedThread;
          });

          scope.intervalId = intervalService.interval(function() {
            messageService.getMessageById(scope.messageThread._id)
              .then(function(data) {
                if(data) {
                  flagMine(data, function(flaggedThread) {
                    scope.messageThread = flaggedThread;
                  });
                  scope.messageThreads[params.index] = data;
                }
              }, function(error) {
                console.log(error);
              })
          }, 5000);

        }
      };
    })()

    scope.back = function() {
      intervalService.cancel(scope.intervalId);
      scope.updateTab("mail");
      state.go("Main.Messages.List");
    };

    scope.getImageURL = function(imageKey) {
      if(imageKey && imageKey !== "") {
        return "https://s3.amazonaws.com/taffer-dev/" + imageKey;
      } else {
        return "";
      }
    };

    scope.formatMessage = function(message) {
      return message.replace(/\n/g, '<br>');
    };

    scope.onLastElement = function() {
      // $(window).scrollTop($(document).height());
      window.scrollTo(0, document.documentElement.scrollHeight);
    };

    scope.afterImageLoad = function() {
      if(++scope.loadCounter === scope.totalImages) {
        // $(window).scrollTop($(document).height());
        window.scrollTo(0, document.documentElement.scrollHeight);
      }
    };

    scope.sendMessage = function() {
      if(scope.file || scope.newMessage && scope.newMessage !== "") {
        var cleanedText = scope.newMessage.replace(/(<([^>]+)>)/ig,"");
        cleanedText = cleanedText.replace(/&nbsp;/gi,"");

        var postData = {
            message: cleanedText,
        };

        if(scope.file) {
            postData.image = scope.file;
        }

        messageService.updateMessage(postData, scope.messageThread._id)
          .then(function(data) {
            scope.newMessage = "";
            scope.$broadcast("message-input:clear");
            flagMine(data, function(flaggedThread) {
              scope.messageThread = flaggedThread;
              $(window).scrollTop($(document).height());
            });

            keenIO.addEvent("messageReply", {
              user: scope.auth.getUser()._id,
              bar: scope.auth.getUser().barId,
              length: cleanedText.length,
              messageThread: scope.messageThread._id,
              image: scope.file ? true : false
            })

          scope.messageThreads[params.index] = data;
          }, function(error) {
            scope.$broadcast("message-input:enable");
            console.log(error);
          });
      }
    };

    scope.viewImage = function(imageKey) {
      var url = "http://s3.amazonaws.com/taffer-dev/" + imageKey;
      cordovaService.inAppBrowser.open(url, null, null, null, function(){
        cordovaService.inAppBrowser.closeCurrent();
    }, null, "hidden=yes,location=no,toolbarposition=top,disallowoverscroll=yes,enableViewportScale=yes,transitionstyle=crossdissolve,allowInlineMediaPlayback=yes,clearcache=no");
      cordovaService.inAppBrowser.getCurrent().show();
    };

    function flagMine(msgObj, cb) {
      for(var i = 0, j = msgObj.messages.length; i < j; i++) {
        var msg = msgObj.messages[i];
        if(msg.from._id == scope.auth.getUser()._id) {
          msg.from.mine = true;
        } else {
          msg.from.mine = false;
        }
      }
      cb(msgObj);
    };

    function getNumOfImages(msgObj) {
      for(var i = 0, j = msgObj.messages.length; i < j; i++) {
        var msg = msgObj.messages[i];
        if(msg.imageKey && msg.imageKey !== "") {
          scope.totalImages++;
        }
      }
    };

    keenIO.addEvent('messageRead', {
      user: scope.auth.getUser()._id,
      bar: scope.auth.getUser().barId,
      messageThread: scope.messageThread._id
    })

  }
]);
