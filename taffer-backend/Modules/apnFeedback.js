var apn = require('apnagent');

module.exports = function(models) {

	var feedback;

	feedback = new apn.Feedback();
	feedback.set('cert file', './Certs/TafferDevCert.pem');
	feedback.set('key file', './Certs/TafferDevKey.pem');
	feedback.set('passphrase', 'Fusion911');
	feedback.set('interval', '1h');
	feedback.enable('sandbox');
	feedback.connect(function(err) {
		if(err) {
			console.log("Feedback connection error: " + err);
		}
	});

	feedback.use(function(device, timestamp, done) {
		var token = device.toString();
		var feedbackTime = timestamp.getTime();

		models.Device.findOne({deviceToken: token, unregistered: false}, function(err, device) {
			if(err) {
				done();
			} else {
				if(device.updated.getTime() <= feedbackTime) {
					device.unregistered = true;
					device.save(function(err, device) {
						done();
					});
				} else {
					// The device has been registered recently; don't deactivate it
					done();
				}
			}
		});
	});

	return feedback;

}
