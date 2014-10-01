angular.module("taffer.controllers")
.controller("CoursesListCtrl", [
  "$scope",
  "$state",
  "CourseService",
  function(scope, state, courseService) {
    scope.tab = 'received';

    var windowHeight = window.innerHeight - 50;
    scope.courseContainerStyle =  {"min-height" : windowHeight};

    scope.showBox = function(tabName) {
      scope.tab = tabName;
    };

    scope.viewCourse = function(course) {
      if(!course.viewed) {
        courseService.update(course._id, {viewed: true})
        .then(function(data) {
          // Do nothing
        }, function(error) {
          console.log(error);
        });
      }

      course.viewed = true;
      scope.updateSelectedCourse(course);

      state.go("Main.Courses.Details");
    };

    scope.receivedCoursesDirection = 'left';
    scope.previousCoursesDirection = 'left';
    scope.currentReceivedCoursesIndex = 0;
    scope.currentPreviousCoursesIndex = 0;

    scope.setCurrentReceivedCourseIndex = function (index) {
      scope.receivedCoursesDirection = (index > scope.currentReceivedCoursesIndex) ? 'left' : 'right';
      scope.currentReceivedCoursesIndex = index;
    };

    scope.setCurrentPreviousCourseIndex = function (index) {
      scope.previousCoursesDirection = (index > scope.currentPreviousCoursesIndex) ? 'left' : 'right';
      scope.currentPreviousCoursesIndex = index;
    };

    scope.isCurrentReceivedCourseIndex = function (index) {
        return scope.currentReceivedCoursesIndex === index;
    };

    scope.isCurrentPreviousCourseIndex = function (index) {
        return scope.currentPreviousCoursesIndex === index;
    };

    scope.prevReceivedCourse = function () {
      scope.receivedCoursesDirection = 'left';
      scope.currentReceivedCoursesIndex = ( scope.currentReceivedCoursesIndex < scope.receivedCourses.length - 1) ? ++ scope.currentReceivedCoursesIndex : 0;
    };

    scope.nextReceivedCourse = function () {
      scope.receivedCoursesDirection = 'right';
      scope.currentReceivedCoursesIndex = ( scope.currentReceivedCoursesIndex > 0) ? -- scope.currentReceivedCoursesIndex : scope.receivedCourses.length - 1;
    };

    scope.prevPreviousCourse = function () {
      scope.previousCoursesDirection = 'left';
      scope.currentPreviousCoursesIndex = (scope.currentPreviousCoursesIndex < scope.previousCourses.length - 1) ? ++scope.currentPreviousCoursesIndex : 0;
    };

    scope.nextPreviousCourse = function () {
      scope.previousCoursesDirection = 'right';
      scope.currentPreviousCoursesIndex = (scope.currentPreviousCoursesIndex > 0) ? --scope.currentPreviousCoursesIndex : scope.previousCourses.length - 1;
    };


  }
]);
