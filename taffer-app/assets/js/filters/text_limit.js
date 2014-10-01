angular.module("taffer.filters")
.filter("truncate", function() {
  return function(value, wordwise, max, tail, maxScreenSize) {
    if(!value) {
      return '';
    }

    if(typeof tail === 'number') {
      maxScreenSize = tail;
      tail = '...';
    }

    if($(window).width() > maxScreenSize) {
      return value;
    }

    max = parseInt(max, 10);
    if(!max) {
      return value;
    }

    if(value.length <= max) {
      return value;
    }

    value = value.substr(0, max);
    if(wordwise) {
      var lastSpace = value.lastIndexOf(' ');
      if(lastSpace != -1) {
        value = value.substr(0, lastSpace);
      }
    }

    return value + (tail || '...');
  };
});
