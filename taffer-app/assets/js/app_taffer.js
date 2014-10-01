angular.module("taffer.app", [
	"taffer.controllers",
	"taffer.services",
	"taffer.directives",
	"taffer.filters",
	"ui.router",
	"oc.modal",
	"ngSanitize",
	"ngTouch",
	"angular-promise-cache",
	"ui.utils.masks"
]);

angular.module("taffer.controllers", []);
angular.module("taffer.services", []);
angular.module("taffer.directives", []);
angular.module("taffer.filters", []);

window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);
