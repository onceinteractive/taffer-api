angular.module("taffer.services")
.factory("SocialService", [
	"api",
	"cordovaService",
	"$ocModal",
	"AuthService",
	function(api, cordovaService, modal, auth) {
		var fbBarAccounts = function(successCB, errorCB) {
			var promise = api.get("facebook/accounts");
			promise.success(function(data, status, headers, config) {
				console.log(data);
				if(data.length === 0) {
					var title = "No Bar Pages Found"
					var question = "Would you like use your personal account for the bar?"
					cordovaService.dialogs.confirm(
						title, question,
						function() {
							var promise = api.post("facebook/setUser");
							promise.success(function(data, status, headers, config) {
								var user = auth.getUser();
								user.facebook = true;
								auth.setUser(user);
								successCB(data);
							});

							promise.error(function(data, status, headers, config) {
								errorCB(data);
							});
						},
						null
					);
					return;
				} else {
					modal.open({
						url: "views/modals/facebook_accounts.html",
						controller: "FacebookAccountsCtrl",
						init: {
							accounts: data,
							linkAccount: function(account) {
								var promise = api.post("facebook/accounts", {pageId: account});
								promise.success(function(data, status, headers, config) {
									modal.close();
									successCB(data);
								});

								promise.error(function(data, status, headers, config) {
									modal.close();
									errorCB(data);
								})
							},
							linkUser: function() {
								var promise = api.post("facebook/setUser");
								promise.success(function(data, status, headers, config) {
									modal.close();
									var user = auth.getUser();
									user.facebook = true;
									auth.setUser(user);
									successCB(data);
								});

								promise.error(function(data, status, headers, config) {
									modal.close();
									errorCB();
								});
							}
						}
					})
				}
			});

			promise.error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		return {
			linkFacebookBar: function(successCB, errorCB) {
				var promise = api.get("facebook/auth/url");
				promise.success(function(data, status, headers, config) {
					var startCB = function(e) {
						console.log("START FIRED");
						var url = e.url;
						var code = /\?code=(.+)$/.exec(url);
						var error = /\?error=(.+)$/.exec(url);

						if(code || error) {
							cordovaService.inAppBrowser.closeCurrent();
							fbBarAccounts(successCB, errorCB);
						}
					};

					var stopCB = function(e) {
						console.log("Stop Reached");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					cordovaService.inAppBrowser.open(data, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					errorCB(data);
				});
			},

			linkFacebookUser: function(successCB, errorCB) {
				var promise = api.get("facebook/auth/url");
				promise.success(function(data, status, headers, config) {
					var startCB = function(e) {
						var url = e.url;
						var code = /\?code=(.+)$/.exec(url);
						var error = /\?error=(.+)$/.exec(url);

						if(code || error) {
							cordovaService.inAppBrowser.closeCurrent();
							var p = api.post("facebook/setUser");
							p.success(function(data, status, headers, config) {
								if(status === 200) {
									var user = auth.getUser();
									user.facebook = true;
									auth.setUser(user);
									successCB(data);
									return;
								}
								errorCB(data);
							});

							p.error(function(data, status, headers, config) {
								errorCB(data);
							});
						}
					};

					var stopCB = function(e) {
						console.log("Stop Reached");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					cordovaService.inAppBrowser.open(data, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					console.log("Error", data);
				});
			},

			loginFacebook: function(successCB, failureCB){
				var promise = api.get("login/facebook/requestUrl");
				promise.success(function(data, status, headers, config) {
					var startCB = function(e) {
						var url = e.url;
						var params = {}
						var regEx = /(\?|\&)([^=]+)\=([^&]+)/ig

						var keyVal

						do {
							keyVal = regEx.exec(url)
							if(keyVal){
								params[keyVal[2]] = keyVal[3]
							}
						} while(keyVal)

						var id = params.id
						var result = params.result
						var error = params.error
						var token = params.token
						if(token.indexOf('#') != -1){
							token = token.slice(0, token.indexOf('#'))
						}

						if(result || error){
							cordovaService.inAppBrowser.closeCurrent();
							if(error){
								exitCB()
								modal.open({
									url: "views/modals/error_message.html",
									cls: "fade-in",
									init: {
										errorMessage: "Sorry, but we couldn't log you in with Facebook right now."
									}
								});
								failureCB()
							} else {
								var promise = api.post("rebuildSession", { id: id, token: token });
			                    promise.success(function(data, status, headers, config) {

			                    	exitCB()
			                        successCB(data, status, headers, config)
			                    });

			                    promise.error(function(data, status, headers, config) {
			                    	exitCB()
			                        modal.open({
										url: "views/modals/error_message.html",
										cls: "fade-in",
										init: {
											errorMessage: "Sorry, but we couldn't log you in with Facebook right now."
										}
									});
									failureCB()
			                    });
							}
						}
					};

					var stopCB = function(e) {
						console.log("Stop Reached");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					cordovaService.inAppBrowser.open(data, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					modal.open({
						url: "views/modals/error_message.html",
						cls: "fade-in",
						init: {
							errorMessage: "Sorry, but we couldn't log you in with Facebook right now."
						}
					});
					failureCB()
				});
			},

			linkTwitterBar: function(successCB, errorCB) {
				var promise = api.get("twitter/bar/requestToken");
				promise.success(function(data, status, headers, config) {
					var reqToken = data.requestToken;
					var startCB = function(e) {
						var verifier = /oauth_verifier=(.+)$/.exec(e.url);
						if(verifier) {
							cordovaService.inAppBrowser.closeCurrent();
							successCB();
						}
					};

					var stopCB = function(e) {
						console.log("STOP CALLBACK");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					var url = "https://twitter.com/oauth/authenticate?oauth_token=" + reqToken;
					cordovaService.inAppBrowser.open(url, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					errorCB(data);
				});
			},

			linkTwitterUser: function(successCB, errorCB) {
				var promise = api.get("twitter/user/requestToken");
				promise.success(function(data, status, headers, config) {
					var reqToken = data.requestToken;
					var startCB = function(e) {
						var verifier = /oauth_verifier=(.+)$/.exec(e.url);
						if(verifier) {
							cordovaService.inAppBrowser.closeCurrent();
							var user = auth.getUser();
							user.twitter = true;
							auth.setUser(user);
							successCB();
						}
					};

					var stopCB = function(e) {
						console.log("STOP CALLBACK");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					var url = "https://twitter.com/oauth/authenticate?oauth_token=" + reqToken;
					cordovaService.inAppBrowser.open(url, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					errorCB(data);
				});
			},

			loginTwitter: function(successCB, failureCB){
				var promise = api.get("login/twitter/requestUrl");
				promise.success(function(data, status, headers, config) {
					var startCB = function(e) {

						var url = e.url;
						var id = /\&id=(.+)[$&]/ig.exec(url);
						if(id)
							id = id[1]
						var token = /\&token=(.+)/ig.exec(url);
						if(token)
							token = token[1]
						var error = /\?error=(.+)[$&]/ig.exec(url);
						if(error)
							error = error[1]
						var result = /\?result=(.+)[$&]/ig.exec(url);
						if(result)
							result = result[1]

						if(result || error) {
							cordovaService.inAppBrowser.closeCurrent();

							if(error){
								exitCB()
								modal.open({
									url: "views/modals/error_message.html",
									cls: "fade-in",
									init: {
										errorMessage: "Sorry, but we couldn't log you in with Twitter right now."
									}
								});
							} else if(result == 'failure'){
								exitCB()
								modal.open({
									url: "views/modals/error_message.html",
									cls: "fade-in",
									init: {
										errorMessage: "Sorry, but we couldn't log you in with Twitter right now."
									}
								});
								failureCB()
							} else {

								var promise = api.post("rebuildSession", { id: id, token: token });
			                    promise.success(function(data, status, headers, config) {
			                    	exitCB()
			                    	successCB(data, status, headers, config)
			                    });

			                    promise.error(function(data, status, headers, config) {
			                    	exitCB()
			                        modal.open({
										url: "views/modals/error_message.html",
										cls: "fade-in",
										init: {
											errorMessage: "Sorry, but we couldn't log you in with Twitter right now."
										}
									});
									failureCB()
			                    });
							}
						}
					};

					var stopCB = function(e) {
						console.log("Stop Reached");
					};

					var exitCB = function(e) {
						cordovaService.inAppBrowser.closeCurrent();
					};

					cordovaService.inAppBrowser.open('https://twitter.com/oauth/authenticate?oauth_token=' + data.requestToken, startCB, stopCB, null, exitCB);
					cordovaService.inAppBrowser.getCurrent().show();
				});

				promise.error(function(data, status, headers, config) {
					modal.open({
						url: "views/modals/error_message.html",
						cls: "fade-in",
						init: {
							errorMessage: "Sorry, but we couldn't log you in with Twitter right now."
						}
					});
					failureCB()
				});
			}
		};
	}
])
