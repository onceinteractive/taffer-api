angular.module("taffer.directives").directive("messageInput", ["cordovaService", function(cordovaService) {
  return {
    restrict: 'E',
    scope: {
      messageModel: '=',
      file: '=',
      sendMessage: '&'
    },
    replace: true,
    templateUrl: 'templates/message-input.html',
    link: function(scope, element, attrs) {
      scope.imageKey = "";
      scope.isDisabled = true;
      scope.messageInput = $("#m-new-message-container");
      
      if(cordovaService.device.isIOS()) {
      	element.focusin(function() {
      		element.css('position', 'absolute');
      		$('#blade-header').hide();
      		$('#blade-nav').hide();
      		$('.m-app-header').hide();
      		$('.m-app-header-nav').hide();
      	});
      
      	element.focusout(function() {
      		element.css('position', 'fixed');
      		$('#blade-header').show();
      		$('#blade-nav').show();
      		$('.m-app-header').show();
      		$('.m-app-header-nav').show();
      	});
      }

      scope.$watch('messageModel', function(newValue, oldValue) {
        if(scope.messageInput.has("img").length > 0 || newValue !== "") {
          scope.isDisabled = false;
        } else {
          scope.isDisabled = true;
        }
      });

      scope.imageSuccess = function(result) {
        scope.imageKey = result.uri;
        scope.file = result.uri;

        // Fancy footwork time:
        // This piece of code appends the image to the message box like normal text messaging functionality
        // If it gets deleted, a new one can be appended. Since we can upload only one, we replace an existing
        // image with the newly selected image.
        var imageElement = "<img id='message-image' alt='Message Photo' src='" + result.uri + "'/>";
        if(scope.messageInput.has("img").length > 0) {
          $("img", scope.messageInput).replaceWith(imageElement);
          scope.isDisabled = false;
        } else {
          scope.messageInput.append(imageElement);
          scope.isDisabled = false;
        }

        scope.$apply();
      };

      scope.send = function() {
        if(!scope.isDisabled) {
          // Set so the user can't repeatedly send the same message
          scope.isDisabled = true;
          scope.sendMessage();
        }
      };

      scope.$on("message-input:clear", function() {
        scope.file = null;
        scope.imageKey = "";
        scope.messageInput.empty();
      });

      scope.$on("message-input:enable", function() {
        scope.isDisabled = false;
      });

    }
  }
}]);
