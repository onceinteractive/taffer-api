angular.module("taffer.services")
.provider("IntervalService", function() {
	this.intervalPromises = [];
	this.defaultInterval = 180000;
	this.$get = [
		"$interval",
		function(interval) {
			var _this = this;

			return {
				interval: function(toExecute, milliseconds) {
					if(!milliseconds) {
						milliseconds = _this.defaultInterval;
					}

					var id = interval(function() {
						toExecute();
					}, milliseconds);
					_this.intervalPromises.push(id);
					return id;
				},

				cancel: function(intervalPromise) {
					var canceled = interval.cancel(intervalPromise);
					if(canceled) {
						var index = _this.intervalPromises.indexOf(intervalPromise);
						_this.intervalPromises.splice(index, 1);
					}
					return canceled;
				},

				cancelAll: function() {
					var len = _this.intervalPromises.length;
					while (len--) {
						var promise = _this.intervalPromises[len];
						var canceled = interval.cancel(promise);
						if(canceled) {
							var index = _this.intervalPromises.indexOf(promise);
							_this.intervalPromises.splice(index, 1);
						}
					}					
				}
				
			}
		}
	];
});
