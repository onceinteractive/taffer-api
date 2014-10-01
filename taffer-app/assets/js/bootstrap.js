(function() {
	function boot() {
		angular.element(document).ready(function() {
			angular.bootstrap(document, ["taffer.app"]);
		});
	};

	if(window.isPhone) {
		document.addEventListener("deviceready", function() {
			boot();
		}, false);
	} else {
		boot();
	}
}).call(this);
