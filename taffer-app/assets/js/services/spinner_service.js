angular.module("taffer.services")
.provider("spinner", function() {
	this.queued = 0;
	this.total = 0;
	this.override = false;
	this.$get = [
		"$rootScope",
		function(rootScope) {
			var _this = this;
			return {
				start: function() {
					if(_this.override) {
						_this.override = false;
						return;
					}

					if(_this.queued === 0) {
						_this.queued += 1;
						_this.total += 1;
						rootScope.$broadcast("spinner:start");
					} else {
						_this.total += 1;
						_this.queued += 1;
					}
				},

				stop: function() {
					if(_this.queued > 0) _this.queued -= 1;
					if(_this.queued === 0) {
						_this.total = 0;
						rootScope.$broadcast("spinner:stop");
					}
				},

				forceStop: function() {
					_this.queued = 0;
					_this.total = 0;
					this.stop();
				},

				getQueued: function() {
					return _this.queued;
				},

				getTotal: function() {
					return _this.total;
				},

				override: function() {
					_this.override = true;
				}
			}
		}
	];
});
