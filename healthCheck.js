var os = require('os')
var cluster = require('cluster')

module.exports = function(app){

	app.get('/', function(req, res){
		var workers = {}
		for(var id in cluster.workers){
			workers[id] = {
				id: cluster.workers[id].id,
				process: cluster.workers[id].process.pid
			}
		}

		res.send({
			hostName: os.hostname(),
			loadAverage: {
				fiveMinutes: os.loadavg()[0],
				tenMinutes: os.loadavg()[1],
				fifteenMinutes: os.loadavg()[2],
			},
			totalMemory: os.totalmem(),
			freeMemory: os.freemem(),
			memoryUsage: os.freemem() / os.totalmem(),
			workers: workers
		})
	})

}