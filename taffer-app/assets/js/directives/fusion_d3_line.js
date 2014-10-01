angular.module("taffer.directives")
// Directive Depends on D3 Being Included in the Page
.directive("fmD3Line", [
	"d3Service",
	function(chartService) {
		return {
			restrict: "A",
			scope: {
				label: "@",
				margin: "@",
				width: "@",
				height: "@",
				granularity: "@",
				sumIndex: "@",
				data: "=",
				click: "&"
			},
			link: function(scope, elem, attrs, ctrl, transclude) {
				var isRendering = false;
				function render() {
					// Clear existing graph in any
					d3.select(elem[0]).select("*").remove();

					// ####### Graph Dimensions Setup ############################################ //
					// Margin needs to be set first to figure out initial heights
					var m = [0,0,0,0];
					if(scope.margin) {
						m = scope.margin.split(",").map(function(x) {
							return parseInt(x) || 0;
						});
					}

					var height = d3.select(elem[0]).node().offsetHeight - m[0] - m[2],
						width = d3.select(elem[0]).node().offsetWidth - m[1] - m[3];

					if(scope.height) {
						height = parseInt(scope.height) - m[0] - m[2];
					}
					if(scope.width) {
						width = parseInt(scope.width) - m[1] - m[3];
					}
					// ############################################################################ //


					// ######## Data Preparation ################################################## //
					var valIndex = parseInt(scope.sumIndex), bin;

					// Sort Data
					scope.data.sort(function(a, b) {
						var testDate = new Date(a[0]);

						var aDate = chartService.getDate(a[0]);
						var bDate = chartService.getDate(b[0]);

						return d3.ascending(aDate, bDate);
					});

					// Create bin based on granularity
					switch(scope.granularity) {
						case "weekly":
							bin = chartService.createBin(scope.data, d3.time.week, valIndex);
							bin.map(function(x) { x.date = chartService.getDate(x.key); });
							bin = chartService.interpolateMissing(bin, "weekly");
							break;
						case "monthly":
							bin = chartService.createBin(scope.data, d3.time.month, valIndex);
							bin.map(function(x) { x.date = chartService.getDate(x.key); });
							bin = chartService.interpolateMissing(bin, "monthly");
							break;
						case "yearly":
							bin = chartService.createBin(scope.data, d3.time.year, valIndex);
							bin.map(function(x) {
								x.date = chartService.getDate(x.key);
							});
							bin = chartService.interpolateMissing(bin, "yearly");
							break;
					}

					// Truncate Bin to the last 7 (for graph size/axes)
					if(bin.length > 7) bin = bin.slice(0, 7);
					// ########################################################################## //

					// #############  D3 Preparation ############################################ //
					var xMin, xMax, yMin, yMax, x, y, lastTick,
						line, graph, format, xAxis, yAxis, paths, customFormatter;

					// Get the x and y min and maxes
					xMin = chartService.getXMin(bin);
					xMax = chartService.getXMax(bin);
					yMin = chartService.getYMin(bin);
					yMax = chartService.getYMax(bin);

					if(yMax > 0 && yMin == yMax) {
						yMin = 0;
					}

					// Create x and y axis scalers
					x = chartService.createXScale(xMin, xMax, width);
					y = chartService.createYScale(yMin, yMax, height);

					// Create line Function
					line = chartService.createLineFunction(x, y);

					// Add graph svg
					graph = chartService.createGraph(elem[0], width, height, m);

					// Set time series format
					switch(scope.granularity) {
						case "weekly":
							format = d3.time.format("%_m/%_d");
							break;
						case "monthly":
							format = d3.time.format("%b");
							break;
						case "yearly":
							format = d3.time.format("%Y");
							break;
					}

					// Create axes
					// Custom xAxis tick values
					lastTick = bin
						.map(function(x, i, a) { return format(x.date); })
						.filter(function(x,i,a) { if(i === a.length - 1) return true; })[0];

					customFormatter = function(d) {
						var d3Format = format(d);
						if(d3Format === lastTick) return "NOW";
						return d3Format.toUpperCase();
					};

					xAxis = chartService.createAxis(x, 7, "bottom", customFormatter);
					yAxis = chartService.createAxis(y, 10, "left", d3.format("s")).tickSize(-width);
					// ########################################################################## //

					// ############# Draw Graph ################################################# //
					// Draw Axes
					chartService.drawXAxis(graph, xAxis, height);
					chartService.drawYAxis(graph, yAxis);

					// Add paths for lines to graph, important for points, must happen after axes drawn
					paths = chartService.addPaths(graph, bin);

					// Draw Line
					chartService.drawLines(paths, line, bin);

					// Draw Points
					chartService.drawPoints(paths, x, y, 5, bin, scope.click);
				};

				if(scope.data > 0) render();
				scope.$watch("data", function() {
					if(!isRendering) {
						isRendering = true;
						render();
						isRendering = false;
					}
				});

				scope.$watch("granularity", function() {
					if(!isRendering) {
						isRendering = true;
						render();
						isRendering = false;
					}
				});

				scope.$watch("sumIndex", function() {
					if(!isRendering) {
						isRendering = true;
						render();
						isRendering = false;
					}
				});

				attrs.$observe("granularity", function(val) {
					scope.granularity = val;
				});

				attrs.$observe("sumIndex", function(val) {
					scope.sumIndex = val;
				});
			}
		};
	}
]);
