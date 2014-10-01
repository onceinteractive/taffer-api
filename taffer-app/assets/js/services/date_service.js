angular.module("taffer.services")
// THIS SERVICE DEPENDS ON MOMENT.JS BEING AVAILABLE
.service("Dates", function() {
	// Finds Dates of a given weekday between two dates
	this.findDayOccurBetween = function(s, e, day) {
		var start = moment(s);
		var end = moment(e);
		var work = start.clone();
		var result = [];

		work.day(day);
		while(work.isBefore(end) || work.isSame(end, "day")) {
			if(work.isAfter(start) || work.isSame(start, "day")) {
				result.push(work.clone().toDate());
			}

			work.day(day + 7);
		}

		return result;
	};

	// Modifays an array of dates by increasing or descreasing by number of a unit.
	this.modifyDates = function(dates, type, num, unit) {
		switch(type) {
			case "inc":
				return dates.map(function(date) {
					var m = moment(date);
					m.add(num, unit);
					return m.format();
				});
				break;

			case "dec":
				return dates.map(function(date) {
					var m = moment(date);
					m.subtract(num, unit);
					return m.format();
				});
				break;

			default:
				return dates;
				break;
		};
	};

	this.findDay = function(date) {
		var endOfTomorrow = moment()
			.add('days', 1)
			.hours(23)
			.minutes(59)
			.seconds(59)
			.milliseconds(999);

		// var shiftStart = moment(date + ( (new Date()).getTimezoneOffset() * 60 * 1000 )  );
		var shiftStart = moment(date).zone( (new Date()).getTimezoneOffset() );
		if(shiftStart.isBefore(endOfTomorrow)) {
			return "Tomorrow";
		} else {
			return shiftStart.format('dddd');
		}
	};

});
