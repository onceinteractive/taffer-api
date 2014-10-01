angular.module("taffer.directives")
.directive("fmTimeInput", [
	function() {
		return {
			restrict: "E",
			templateUrl: "templates/fusion_time_input.html",
			scope: {
				ngModel: "=",
				steps: "@",
				existingTime: "@"
			},
			link: function(scope, elem, attr) {
				var steps = parseInt(scope.steps);

				scope.hourClick = function() {
					console.log("Hour Clicked");
					elem.find(".ti-hour-select").open();
				};

				scope.minuteClick = function() {
					elem.find(".ti-hour-select").click();
				};

				scope.minutes = [];
				scope.hours = ["1","2","3","4","5","6","7","8","9","10","11","12"]
				var i = 0;
				while(i <= 60) {
					var minute;
					if(i < 10) {
						minute = "0" + i;
					} else {
						minute = "" + i;
					}

					scope.minutes.push(minute);

					i += steps;
				}

				var length = scope.minutes.length;
				if(scope.minutes[length - 1] == "60") {
					var index = scope.minutes.indexOf("60");
					scope.minutes.splice(index, 1);
				}

				// Default time
				scope.hour = scope.hours[11];
				scope.minute = scope.minutes[0];

				// Populate existing time
				scope.$watch("existingTime", function() {
					if(scope.existingTime && scope.existingTime !== "") {
						var times = scope.existingTime.split(":");
						if(parseInt(times[0]) > 12) {
							scope.hour = "" + (parseInt(times[0]) - 12);
							scope.ampm = true;
						} else if(parseInt(times[0]) == 12) {
							scope.hour = "" + (parseInt(times[0]));
							scope.ampm = true;
						} else if(parseInt(times[0]) == 0) {
							scope.hour = "12";
							scope.ampm = false;
						} else {
							scope.hour = "" + (parseInt(times[0]));
							scope.ampm = false;
						}

						scope.minute = times[1];
					}
				});

				scope.$watch("hour", function(a, b) {
					updateModel();
				});

				scope.$watch("minute", function(a, b) {
					updateModel();
				});

				scope.$watch("ampm", function(a, b) {
					updateModel();
				});

				function updateModel() {
					var	ampm = scope.ampm ? "pm" : "am";
					var hour = correctHour(ampm);
					var	minute = scope.minute;

					scope.ngModel = hour + ":" + minute;
					console.log(scope.ngModel);
				};

				function correctHour(ampm) {
					if(ampm === "pm" && scope.hour != "12") {
						return "" + (parseInt(scope.hour) + 12);
					}

					if(ampm === "pm") {
						if(parseInt(scope.hour) < 10) {
							return "0" + scope.hour;
						}
						return scope.hour;
					}

					if(ampm === "am" && scope.hour != "12") {
						if(parseInt(scope.hour) < 10) {
							return "0" + scope.hour;
						}
						return scope.hour;
					}

					return "00";
				};
			}
		};
	}
]);
