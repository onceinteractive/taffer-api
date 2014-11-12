var apn = require('apnagent');

module.exports = function(models) {

	var agent;

	agent = new apn.Agent();
	 agent.set('cert file', './Certs/BarHQDevCert.pem');
	 agent.set('key file', './Certs/BarHQDevKey.pem');
	//agent.set('cert file', './Certs/BarHQProdCert.pem');
	//agent.set('key file', './Certs/BarHQProdKey.pem');
	agent.set('passphrase', 'B@rHQ123');
	agent.set('expires', '1h');
	agent.set('reconnect delay', '1s');
	agent.set('cache ttl', '30m');

	 agent.enable('sandbox');



	agent.on('message:error', function(err, msg) {
		if(err.name === 'GatewayNotificationError') {
			console.log('[message:error] GatewayNotificationError: %s', err.message);

			if(err.code === 8) {
				models.Device.findOne({deviceToken: msg.device().toString()}, function(err, device) {
					if(err) {
						console.log("Could not find user by failed device token: " + msg.device().toString());
					} else {
						device.unregistered = true;
						device.save(function(err, device) {
							if(err) {
								console.log("Could not set failed user token to unregistered. Device ID: " + device._id);
							}
						});
					}
				});
			}
		}	console.log('agent.on called end: '+err);
	});

	agent.connect(function(err) {

		if(err && err.name === 'GatewayAuthorizationError') {
			console.log("APN Agent Authentication Error: %s", err.message);
			process.exit(1);
		} else if(err) {
			console.log("APN agent connection error: " + err);
		} else {
			console.log("APN agent connected.");
		}

	});

	return agent;
}
