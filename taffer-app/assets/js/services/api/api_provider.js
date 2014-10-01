angular.module("taffer.services").provider("api", function() {
    this.baseUrl = "";

    this.$get = [
		"$http", function(http) {
	        var _this = this;
	        return {
				get: function(url, config) {
					return http.get("" + _this.baseUrl + url, config);
				},
				post: function(url, data, config) {
					return http.post("" + _this.baseUrl + url, data, config);
				},
				put: function(url, data, config) {
					return http.put("" + _this.baseUrl + url, data, config);
				},
				"delete": function(url, config) {
					return http["delete"]("" + _this.baseUrl + url, config);
				},
				create: function(url, data, config) {
					return this.post(url, data, config);
				},
				read: function(url, config) {
					return this.get(url, config);
				},
				update: function(url, data, config) {
					return this.put(url, data, config);
				},
				destroy: function(url, config) {
					return this["delete"](url, config);
				}
			};
		}
    ];

    this.setBaseUrl = function(baseUrl) {
      this.baseUrl = baseUrl;
    };
});
