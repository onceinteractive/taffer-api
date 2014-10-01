angular.module("taffer.services")
.provider("AuthService", function() {
	this.user = null;
	this.$get = [
		"api",
		"cordovaService",
		"$q",
		"promiseCache",
		"IntervalService",
		"spinner",
		"$state",
		function(api, cordovaService, q, promiseCache, interval, spinner, state) {
			var _this = this;
			return {
				isLoggedIn: function() {
					var deferred = q.defer();

					var token = localStorage.getItem("taffer_token");
					if(token) {
						this.setUser(JSON.parse(token));
						if(cordovaService.device.isIOS()) {
							var obj = this;
							this.rebuildSession(token.id, token.token)
								.then(function(user) {
									// Session successful, set user, logged in
									deferred.resolve(true);
								}).catch(function(err) {
									// Session failed, set user null, login failed
									obj.setUser(null);
									localStorage.removeItem("taffer_token");
									deferred.resolve(false);
								});
						} else {
							// Not IOS don't bother with rebuild session, cookies are set already
							deferred.resolve(true);
						}
					} else {
						// No user and no token, not logged in
						deferred.resolve(false);
					}

					return deferred.promise;
				},

				getUser: function() {
					if(!_this.user) {
						var token = localStorage.getItem("taffer_token");
						if(token) {
							this.setUser(JSON.parse(token));
						}
					}

					return _this.user;
				},

				setUser: function(user) {
					localStorage.setItem("taffer_token", JSON.stringify(user));
					_this.user = user;
				},

				hasPermission: function(feature, permission) {
					if(_this.user) {
						var feature = _this.user.permissions[feature];
						if(feature) {
							return feature[permission];
						} else {
							return false;
						}
					} else {
						return false;
					}
				},

				hasRole: function(role) {
					var roleCheck = role.toLowerCase();
					if(this.getUser()) {
						return _this.user.role.toLowerCase() == roleCheck;
					}
					return false;
				},

				login: function(email, password) {
					var data = {email: email, password: password};
					var obj = this;
					return api.post("login", data)
						.then(function(result, status) {
							if(result.status === 200) {
								localStorage.setItem("taffer_token", JSON.stringify(result.data));
								obj.setUser(result.data);
							} else if(status == 510){
								return 'noConnection'
							}

							return result.data;
						});
				},

				rebuildSession: function(id, token) {
					var data = {id: this.getUser().id, token: this.getUser().token};
					var obj = this;
					return api.post("rebuildSession", data)
						.then(function(result) {
							if(result.status === 200) {
								localStorage.setItem("taffer_token", JSON.stringify(result.data));
								obj.setUser(result.data);
							}

							return result.data;
						});
				},

				logout: function() {
					interval.cancelAll();
					promiseCache.removeAll(false);

					api.delete("login")
						.then(function(result) {
							_this.user = null;
							localStorage.removeItem("taffer_token");
							localStorage.clear();
							spinner.start();
							cordovaService.inAppBrowser.open(
								"http://www.google.com",
								null,
								function() {
									spinner.stop();
									cordovaService.inAppBrowser.closeCurrent();
									state.go("Login");
								},
								function(err) {
									spinner.stop();
									state.go("Login");
								},
								function() {
									spinner.stop();
									state.go("Login");
								},
								null,
								"hidden=yes,clearcache=yes,allowInlineMediaPlayback=yes"
							);
						}).catch(function(err) {
							console.log(err.data);
							console.log(err.status);
						});
				},

				kickUser: function() {
					if(_this.user) {
						promiseCache.removeAll(false);
						interval.cancelAll();
						_this.user = null;
						localStorage.removeItem("taffer_token");
						localStorage.clear();
						spinner.start();
						cordovaService.inAppBrowser.open(
							"http://www.google.com",
							null,
							function() {
								spinner.stop();
								cordovaService.inAppBrowser.closeCurrent();
								state.go("Login");
							},
							function(err) {
								spinner.stop();
								state.go("Login");
							},
							function() {
								spinner.stop();
								state.go("Login");
							},
							null,
							"hidden=yes,clearcache=yes,allowInlineMediaPlayback=yes"
						);
					} else {
						state.go("Login");
					}
				}
			};
		}
	]
});
