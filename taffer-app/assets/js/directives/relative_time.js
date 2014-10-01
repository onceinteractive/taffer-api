angular.module("taffer.directives").directive("relativeTime", function($timeout) {
  return {
    restrict: 'E',
    scope: {
      datetime: '@'
    },
    link: function(scope, element, attrs) {

      scope.$watch('datetime', function (dateString) {
        if(dateString && dateString !== "") {
          var date = moment(dateString);

          if(!date) {
            return;
          }

          element.text(diffString(date));

          function diffString(date) {
            var now = moment();
            if(Math.abs(date.clone().startOf('day').diff(now, 'days', true)) < 1) {
              return date.from(now);
            } else {
              return date.calendar(now);
            }
          }
        } else {
          element.text(moment('2000-01-01').fromNow());
        }
      });
    }
  }
});
