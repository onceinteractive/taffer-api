angular.module("taffer.controllers")
.controller("SalesEditCtrl", [
	"$scope",
	"$state",
	"$ocModal",
	"api",
	"SALES",
	"KeenIO",
	"AuthService",
	function(scope, state, modal, api, SALES, keenIO, auth) {
		scope.previousSales = SALES.data;
		scope.selectedDate = moment().format("YYYY-MM-DD");
		scope.barOpenTime = null;
		scope.barCloseTime = null;

		var inputs = angular.element(".l-sales-form-input-input");
		for(var i = 0, len = inputs.length; i < len; i++) {
			// Although the input will fail validation when a char is entered,
			// here we'll completely disable any entrance of non-numeric chars
			inputs[i].addEventListener('keypress', function(e) {
				if(e.which != 8 && e.which != 46 && e.which < 48 || e.which > 57) {
					e.preventDefault();
				}
			});
		}

		scope.monthChanged = function(changed) {
			var seed = moment(changed.date);
			var start = seed.clone().startOf("month").format("YYYY-MM-DD");
			var end = seed.clone().endOf("month").format("YYYY-MM-DD");
			var format = "?startDate=" + start + "&endDate=" + end;

			var promise = api.get("sales" + format);
			promise.success(function(data, status, headers, config) {
				scope.previousSales = data;
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		scope.dayChanged = function(changed) {
			if(scope.previousSales && scope.previousSales.length > 0) {
				getPreviousData(changed.date);
			} else {
				resetForm();
			}
		};

		scope.preventCharacters = function(value) {
			return parseInt(value);
		}

		scope.cancel = function() {
			state.go("Main.Sales.View");
		};

		scope.save = function() {
			if(scope.salesEditForm.$valid) {

				var sales = 0;
				if(typeof scope.total !== "number")  {
					sales = parseFloat(scope.total.replace(",", "").replace("$", ""));
				} else {
					sales = scope.total;
				}

				if(isNaN(sales)) {
					modal.open({
						url: "views/modals/error_message.html",
						init: {
							errorMessage: "Total sales must be a number or decimal notated value."
						},
						cls: "fade-in"
					});
				} else {
					data = {
						day: moment(scope.selectedDate).valueOf(),
						salesAmount: sales,
						guestCount: scope.guestCount,
						staffScheduled: scope.numMembers,
						barOpenTime: scope.openTime,
						barCloseTime: scope.closeTime
					};

					var promise = api.post("sales", data);
					promise.success(function(data, status, headers, config) {
						if(status === 200) {
							state.go("Main.Sales.View");
						}

						keenIO.addEvent('salesEntered', {
							user: auth.getUser()._id,
							bar: auth.getUser().barId
						})
					});

					promise.error(function(data, status, headers, config) {
						modal.open({
							url: "views/modals/error_message.html",
							init: {
								errorMessage: "There was an error saving the sales data."
							},
							cls: "fade-in"
						});
					});
				}
			} else {
				modal.open({
					url: "views/modals/error_message.html",
					init: {
						errorMessage: "Please fill out all fields completely."
					},
					cls: "fade-in"
				});
			}
		};

		// Helper Functions
		function getPreviousData(date) {
			var sales = scope.previousSales.filter(function(x) {
				if(x[0] === date) {
					return true;
				}
				return false;
			});

			if(sales && sales.length > 0) {
				scope.total = sales[0][1];
				scope.guestCount = sales[0][2];
				scope.numMembers = sales[0][3];
				scope.openTime = sales[0][4];
				scope.closeTime = sales[0][5];
			} else {
				resetForm();
			}

		};

		function resetForm() {
			scope.total = "";
			scope.guestCount = "";
			scope.numMembers = "";
			scope.openTime = "00:00";
			scope.closeTime = "00:00";
		}
	}
]);
