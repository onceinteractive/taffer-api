angular.module("taffer.directives").directive("backImage", function() {
    return function(scope, element, attrs){
      var url = attrs.backImage;
      element.css({
          'background-image': 'url(' + url +')',
          'background-size' : 'cover',
          'width': '100%',
          'height': '100%'
      });
    };
});
