angular.module("taffer.services")
.factory("ScheduleService", [
	"api",
	"$q",
	function(api, q) {
		return {
			nextShift: function() {
				return api.get("shifts/nextShift");
			},

			getShifts: function(start, end) {
				var queryParams = "";
				if(start && end) {
					queryParams = "?start=" + start + "&end=" + end;
				}

				return api.get("shifts" + queryParams);
			},

			prepareShifts: function(shifts) {
				var prepared = {};
				var deferred = q.defer();

				if(shifts.length === 0){
					deferred.resolve(prepared);
				} else {
					var scheduledPublished = true;
					shifts.map(function(x) {
						var startTime = new Date(x.startTimeUTC);
						var endTime = new Date(x.endTimeUTC);

						if(!prepared[x.user._id]) {
							prepared[x.user._id] = {
								shifts:[]
							}
						}

						if(!x.published) {
							scheduledPublished = false;
						}

						prepared[x.user._id].shifts.push({
							id: x._id,
							startTime: startTime,
							endTime: endTime,
							isOpening: x.isOpening,
							isClosing: x.isClosing,
							published: x.published
						});

					});
					
					prepared.published = scheduledPublished;
					deferred.resolve(prepared);
				}

				return deferred.promise;
			},

			prepareUsers: function(users) {
				var prepared = {};
				var deferred = q.defer();

				if(users.length === 0) {
					deferred.resolve(prepared);
				} else {
					users.map(function(x) {
						if(!prepared[x._id]) {
							prepared[x._id] = {
								firstName: x.firstName,
								lastName: x.lastName,
								pictureURI: x.pictureURI || "",
								role: x.role.toLowerCase()
							}
						}
					});

					deferred.resolve(prepared);
				}

				return deferred.promise;
			},

			getUpcomingTimeOff: function(start, end) {
				var queryParams = "";
				if(start && end) {
					queryParams = "?start=" + start + "&end=" + end;
				}

				return api.get("timeoff/upcoming" + queryParams);
			},

			prepareTimeOffs: function(timeoffs) {
				var prepared = {};
				var deferred = q.defer();

				if(timeoffs.length === 0){
					deferred.resolve(prepared);
				} else {
					timeoffs.map(function(x) {
						var startTime = new Date(x.startTimeUTC);
						var endTime = new Date(x.endTimeUTC);

						if(!prepared[x.requestor._id]) {
							prepared[x.requestor._id] = {
								timeoffs:[]
							}
						}

						prepared[x.requestor._id].timeoffs.push({
							id: x._id,
							startTime: startTime,
							endTime: endTime,
							isAllDay: x.allDay,
							status: x.approvalStatus
						});
					});

					deferred.resolve(prepared);
				}

				return deferred.promise;
			},

			getSchedule: function(start, end) {
				return q.all([
					api.get("users/all").then(this.prepareUsers),
					this.getShifts(start, end).then(this.prepareShifts)
				]).then(function(res) {
					console.log(res);
					return $.extend({},res[0],res[1]);
				});
			},

			saveShift: function() {
				return "something";
			},

			getEvents: function() {
				return "something";
			},

			saveEvent: function() {
				return "something";
			},

			publish: function(startOfWeek, endOfWeek) {
				return api.post("shifts/publish", {weekStart: startOfWeek, weekEnd: endOfWeek})
					.then(function(response) {
						return response.data;
					}, function(response) {
						return q.reject(response.data);
				});
			}
		}
	}
]);
