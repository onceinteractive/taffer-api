angular.module('taffer.directives')
.directive('progressBar', function() {
    return function($scope, element) {

        $scope.$on('progress-animate', function() {
            progressAnimate(1000);
        });

    };
    function progressAnimate(speed) {
        //reset width to 0 to avoid weird animation
        $("#scheduleProgressBar").css('width', 0);
        $("#scheduleProgressBar").removeClass('hint--always');
        console.log('progress animate');
        var size = $("#progressDiv").width();
        var width = $("#scheduleProgressBar").attr("aria-valuenow");

        console.log('size:'+size);
        console.log('width:'+width);

        $("#scheduleProgressBar").animate({
            'background-size': size+'px',
             'width' : width+'%'
        }, speed, function() {
            $(this).addClass('hint--always');
        });
    }
});
