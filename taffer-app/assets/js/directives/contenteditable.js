angular.module("taffer.directives")
  .directive('contentedit', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function(e) {
          scope.$apply(read);
        });
        read(); // initialize

        // Write data to the model
        function read() {
          var tempHtml = element.html();

          // The browser adds a br tag when enter is hit multiple times; remove it
          tempHtml = tempHtml.replace(/<br>/g, '');
          // Replace the leading div tag with a line feed for saving. Seems
          // weird, but this is preserved in push notifications.
          // When this text is built in the UI, we replace \n with a <br> tag
          // for proper display on the page.
          tempHtml = tempHtml.replace(/<div>/g, '\n');
          // Remove the trailing div tag
          html = tempHtml.replace(/<\/div>/g, '');

          // ** I don't know what this does, but I left it.
          //
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  }]);
