angular.module("taffer.controllers")
.controller("NotificationsCtrl", [
  "$scope",
  "$state",
  "api",
  "NotificationService",
  "NOTIFICATIONS",
  function(scope, state, api, notificationService, NOTIFICATIONS) {
    scope.notifications = NOTIFICATIONS;
    scope.selectedNotification = null;
    scope.deleting = false;

    (function() {
      window.scrollTo(0,0);
    })();

    scope.$watch('notifications', function() {
      if(scope.notifications && scope.notifications.length > 0) {
        scope.$emit("child-show-edit");
      } else {
        scope.$emit("child-hide-edit");
      }
    });

    (function() {
      notificationService.getNotificationCount()
        .then(function(data) {
          // Do nothing
        }, function(error) {
          console.log(error);
        });
    })()

    scope.$on("parent-edit", function() {
      scope.deleting = true;
      scope.$emit("child-show-done");
    });

    scope.$on("parent-done", function() {
      scope.deleting = false;
      scope.selectedMessage = null;
      scope.$emit("child-hide-done");
    });

    scope.toggleNotification = function(notification) {
      if(scope.selectedNotification == notification) {
        scope.selectedNotification = null;
      } else {
        scope.selectedNotification = notification;
      }
    };

    scope.isNotificationSelected = function(notification) {
      return scope.selectedNotification == notification;
    };

    scope.markAsRead = function(notification) {
      if(notification.status == 'unread' && notification.shouldShow) {
        scope.updateNotificationCount(scope.notificationCount - 1);
      }

      if(notification.status == 'unread') {
        notification.status = 'read';
        notificationService.markAsRead(notification._id)
          .then(function(data) {
          }, function(error) {
            console.log(error);
          });
      }

      if(notification.pageUrl && notification.pageUrl !== "") {
        scope.$emit("child-hide-edit");
        scope.$emit("child-hide-done");
        if(notification.message.indexOf("suggestion") > -1) {
          state.go("Main.Messages.List", {tab: "suggestion"});
        } else {
          state.go(notification.pageUrl);
        }
      }

    };

    scope.deleteNotification = function(notification, index) {
      scope.notifications.splice(index, 1);

      if(notification.status == 'unread' && notification.shouldShow) {
        scope.updateNotificationCount(scope.notificationCount - 1);
      }

      if(scope.notifications && scope.notifications.length == 0) {
        scope.deleting = false;
        scope.$emit("child-hide-done");
        scope.$emit("child-hide-edit");
      }

      notificationService.delete(notification._id)
        .then(function(data) {
        }, function(error) {
          console.log(error);
        });
    };


  }
]);
