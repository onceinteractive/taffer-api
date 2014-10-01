angular.module("taffer.directives").directive("currencyInput", function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      if(element) {
        $(element).inputmask("decimal",{
          radixPoint:".", 
          groupSeparator: ",", 
          digits: 2,
          autoGroup: true,
          prefix: '$'
        });
      }
      
    }
  }
});
