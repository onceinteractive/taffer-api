var apn = require('apnagent');

module.exports = function(models) {
	console.log('APNagent.js called ');
	var agent;

	agent = new apn.Agent();
	 agent.set('cert file', './Certs/cert.pem');
	 agent.set('key file', './Certs/PushChatKey.pem');
	//agent.set('cert file', './Certs/TafferProdCert.pem');
	//agent.set('key file', './Certs/TafferProdKey.pem');
	agent.set('passphrase', '1234');
	agent.set('expires', '1h');
	agent.set('reconnect delay', '1s');
	agent.set('cache ttl', '30m');

	 agent.enable('sandbox');



	agent.on('message:error', function(err, msg) {
		console.log('agent.on called error: '+err);
		console.log('agent.on called message: '+msg.toString());
		// test code

		switch (err.name) {
			// This error occurs when Apple reports an issue parsing the message.
			case 'GatewayNotificationError':
				console.log('[message:error] GatewayNotificationError: %s', err.message);

				// The err.code is the number that Apple reports.
				// Example: 8 means the token supplied is invalid or not subscribed
				// to notifications for your application.
				if (err.code === 8) {
					console.log('    > %s', msg.device().toString());
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
					// In production you should flag this token as invalid and not
					// send any futher messages to it until you confirm validity
				}

				break;

			// This happens when apnagent has a problem encoding the message for transfer
			case 'SerializationError':
				console.log('[message:error] SerializationError: %s', err.message);
				break;

			// unlikely, but could occur if trying to send over a dead socket
			default:
				console.log('[message:error] other error: %s', err.message);
				break;
		}

	// test code end		.
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
		console.log('agent.connect called error: '+err);
		if(err && err.name === 'GatewayAuthorizationError') {
			console.log("APN Agent Authentication Error: %s", err.message);
			process.exit(1);
		} else if(err) {
			console.log("APN agent connection error: " + err);
		} else {
			console.log("APN agent connected.");
		}
		console.log('agent.connect called end: '+err);
	});

	return agent;
}
