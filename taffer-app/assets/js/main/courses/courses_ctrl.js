angular.module("taffer.controllers")
.controller("CoursesCtrl", [
  "$scope",
  "$state",
  "api",
  "AuthService",
  "COURSES",
  function(scope, state, api, auth, COURSES) {
    scope.auth = auth;
    scope.courses = COURSES;
    scope.receivedCourses = [];
    scope.previousCourses = [];

    (function() {
      window.scrollTo(0,0);
    })();

    scope.courses.forEach(function(course) {
      if(course.complete) {
        scope.previousCourses.push(course);
      } else {
        scope.receivedCourses.push(course);
      }
    });

    scope.selectedCourse = null;

    scope.updateSelectedCourse = function(course) {
      scope.selectedCourse = course;
    };

    scope.updateCompletedCourse = function(course) {
      var index = scope.receivedCourses.indexOf(course);
      if(index > -1) {
        scope.receivedCourses.splice(index, 1);
      }

      var place = scope.previousCourses.indexOf(course);
      if(place < 0) {
        scope.previousCourses.unshift(course);
      }
    };


  }
]);
