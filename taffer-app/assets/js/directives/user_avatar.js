angular.module("taffer.directives").directive("userAvatar", function() {
  return {
    restrict: 'E',
    scope: {
      avatarSelected: '@'
    },
    replace: true,
    templateUrl: 'templates/user-avatar.html',
    link: function(scope, element, attrs) {
      var sourcePrefix = "https://s3.amazonaws.com/taffer-dev/";
      scope.userFirstName = "";
      scope.userLastName = "";
      // scope.userPictureSource = "img/avatar.png";
      scope.isManager = false;
      scope.isSelected = false;
      scope.imageLoaded = false

      attrs.$observe('avatarSource', function(value) {
        if(attrs.avatarSource && attrs.avatarSource.toUpperCase() !== "GROUP") {
          scope.userPictureSource = sourcePrefix + value;
        } else if(attrs.avatarSource && attrs.avatarSource.toUpperCase() == "GROUP") {
          scope.userPictureSource = "img/group_avatar.png";
        }
      });

      scope.afterImageLoad = function(){
        scope.imageLoaded = true
        scope.$apply()
      }

      attrs.$observe('avatarFirstName', function(value) {
        if(attrs.avatarFirstName) {
          scope.userFirstName = value;
        }
      });

      attrs.$observe('avatarLastName', function(value) {
        if(attrs.avatarLastName) {
          scope.userLastName = attrs.avatarLastName.charAt(0) + ".";
        }
      });

      attrs.$observe('avatarRole', function() {
        if(attrs.avatarRole) {
          if(attrs.avatarRole.toLowerCase() == 'manager'
          || attrs.avatarRole.toLowerCase() == 'owner') {
            scope.isManager = true;
          }
        }
      });

      attrs.$observe('avatarSelected', function() {
        if(scope.avatarSelected == "true") {
          scope.isSelected = true;
        } else {
          scope.isSelected = false;
        }
      });

    }
  }
});
