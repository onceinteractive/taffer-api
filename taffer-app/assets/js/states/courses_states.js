angular.module("taffer.app")
.config([
	"$stateProvider",
	function(stateProvider) {
		stateProvider.state("Main.Courses", {
			abstract: true,
			url: "/courses",
			views: {
				"courses": {
					template: '<div id="l-courses-view" class="view" ui-view></div>',
					controller: "CoursesCtrl",
					resolve: {
						COURSES: ["CourseService", function(courseService) {
							return courseService.getCourses().catch(function() {
								return [];
							});
						}]
					}
				}
			}
		})

		.state("Main.Courses.List", {
			url: "/courseslist",
			templateUrl: "views/main/courses/courses_list.html",
			controller: "CoursesListCtrl"
		})

		.state("Main.Courses.Details", {
			url: "/coursesdetails?share",
			templateUrl: "views/main/courses/course_details.html",
			controller: "CourseDetailsCtrl",
			resolve: {
				RECIPIENTS: ["CourseService", function(courseService) {
					return courseService.getCourseRecipients().catch(function() {
						return [];
					});
				}]
			}
		})

		.state("Main.Courses.Quiz", {
			url: "/coursequiz",
			templateUrl: "views/main/courses/course_quiz.html",
			controller: "CourseQuizCtrl"
		});
	}
]);
