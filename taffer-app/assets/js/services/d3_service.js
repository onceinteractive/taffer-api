angular.module("taffer.services")
.factory("d3Service", [
	function() {
		var functions = {
			getDate: function(d) {
				return moment(d).toDate();
			},

			createBin: function(data, timeSeries, sumIndex) {
				return d3.nest()
					.key(function(d) { return timeSeries(moment(d[0]).toDate()); })
					.rollup(function(a) { return d3.sum(a, function(d) { return d[sumIndex]; }); })
					.entries(data);
			},

			interpolateMissing: function(bin, time) {
				var end, begin, all, hash;
				end = moment(new Date());
				all = [];
				switch(time) {
					case "weekly":
						end.startOf("week");
						begin = end.clone().subtract(6, "week");
						d3.time.weeks(begin.toDate(), end.toDate()).map(function(x) {
							all.push(x);
						});
						all.push(end.toDate());
						break;
					case "monthly":
						end.startOf("month");
						begin = end.clone().subtract(6, "month");
						d3.time.months(begin.toDate(), end.toDate()).map(function(x) {
							all.push(x);
						});
						all.push(end.toDate());
						break;
					case "yearly":
						end.startOf("year");
						begin = end.clone().subtract(6, "year");
						d3.time.years(begin.toDate(), end.toDate()).map(function(x) {
							all.push(x);
						});
						all.push(end.toDate());
						break;
				}

				hash = {};
				bin.map(function(x) {
					hash[x.date] = x;
				});

				bin = all.map(function(x) {
					var val = 0;
					if(hash[x]) {
						return hash[x];
					}
					return {key: x.toString(), date: x, values: val};
				});

				return bin;
			},

			getXMin: function(bin) {
				return bin[0].date;
			},

			getYMin: function(bin) {
				return d3.min(bin.map(function(x){ return x.values }));
			},

			getXMax: function(bin) {
				return bin[bin.length - 1].date;
			},

			getYMax: function(bin) {
				return d3.max(bin.map(function(x){ return x.values }));
			},

			createXScale: function(min, max, width) {
				return d3.time.scale().domain([min, max]).range([0, width]);
			},

			createYScale: function(min, max, height) {
				return d3.scale.linear().domain([min, max]).range([height, 0]);
			},

			createLineFunction: function(xScale, yScale) {
				return d3.svg.line()
					.x(function(d,i) { return xScale(d.date); })
					.y(function(d,i) { return yScale(d.values); });
			},

			createGraph: function(element, width, height, margin) {
				return d3.select(element).append("svg:svg")
					.attr("width", width + margin[1] + margin[3])
					.attr("height", height + margin[0] + margin[2])
					.append("svg:g")
					.attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");
			},

			createAxis: function(scaler, ticks, orient, format) {
				if(typeof ticks === "object") {
					return d3.svg.axis().scale(scaler).tickValues(ticks).orient(orient);
				} else {
					return d3.svg.axis().scale(scaler).ticks(ticks).orient(orient).tickFormat(format);
				}
			},

			drawXAxis: function(graph, axis, translate) {
				graph.append("svg:g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + translate + ")")
					.call(axis);
			},

			drawYAxis: function(graph, axis, translate) {
				graph.append("svg:g")
					.attr("class", "y axis")
					.call(axis);
			},

			addPaths: function(graph, bin) {
				return graph.selectAll("path.line")
					.data(bin)
					.enter()
					.append("svg:g");
			},

			drawLines: function(paths, lineFunction, bin) {
				paths.append("svg:path")
					.attr("d", lineFunction(bin));
			},

			drawPoints: function(paths, xScale, yScale, radius, bin, clickHandler) {
				paths.selectAll(".point")
					.data(bin.slice(1))
					.enter().append("svg:circle")
						.attr("class", "point")
						.attr("r", radius)
						.attr("cx", function(d,i) {	return xScale(d.date); })
						.attr("cy", function(d,i) { return yScale(d.values); })
						.on("click", function(d,i) { clickHandler({d:d,i:i}); });
			}
		}

		return functions;
	}
]);
