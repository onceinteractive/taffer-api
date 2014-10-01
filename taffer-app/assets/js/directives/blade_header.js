angular.module("taffer.directives").directive("bladeHeader", function() {
  return {
    restrict: 'E',
    scope: {
      bladeTitle: '@',
      save: '&',
      cancel: '&',
      back: '&',
      done: '&',
      submit: '&'
    },
    transclude: true,
    templateUrl: 'templates/blade.html',
    link: function(scope, element, attrs) {
      scope.showBack = attrs.back;
      scope.showCancel = attrs.cancel;
      scope.showSave = attrs.save;
      scope.showDone = attrs.done;
      scope.showSubmit = attrs.submit;
      scope.backButtonRight = false;
      scope.cancelButtonRight = false;
      scope.saveButtonLeft = false;
      scope.doneButtonLeft = false;
      scope.submitButtonLeft = false;

      if(attrs.backPosition && attrs.backPosition.toLowerCase() == 'right') {
        scope.backButtonRight = true;
      }

      if(attrs.cancelPosition && attrs.cancelPosition.toLowerCase() == 'right') {
        scope.cancelButtonRight = true;
      }

      if(attrs.savePosition && attrs.savePosition.toLowerCase() == 'left') {
        scope.saveButtonLeft = true;
      }

      if(attrs.donePosition && attrs.donePosition.toLowerCase() == 'left') {
        scope.doneButtonLeft = true;
      }

      if(attrs.submitPosition && attrs.submitPosition.toLowerCase() == 'left') {
        scope.submitButtonLeft = true;
      }
    }
  }
});
