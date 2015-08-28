var cluster = require('cluster')

if(cluster.isMaster){

	cluster.fork()

	cluster.on('online', function(worker){
		console.log('Daemon worker process is online.')
	})

	cluster.on('exit', function(worker){
		console.log('Daemon worker process has died. Booting another.')
		cluster.fork()
	})

} else {

	var mongoose = require('mongoose')
	var mongoDbURI
	if(process.argv.indexOf('localdb') != -1){
		mongoDbURI = 'mongodb://localhost/taffer'
	} else {
        //mongoDbURI = 'mongodb://54.221.103.199/taffer'

        /*Test Database*/
        mongoDbURI = 'mongodb://developer:onceinteractive@ds035603.mongolab.com:35603/taffer-test'

        /*Demo Database*/
        //mongoDbURI = 'mongodb://tafferUser:welcome83@ds047930.mongolab.com:47930/heroku_app30886667'
        //mongoDbURI = 'mongodb://tafferUser:welcome83@linus.mongohq.com:10051/app30886667'

        /*Prod Database*/
        //mongoDbURI = 'mongodb://barhq_prod_user:taFFerBarhQ@ds053740-a0.mongolab.com:53740,ds053740-a1.mongolab.com:53740/prod_barhq'
	}

	var mongoDbOptions = {}
	if(process.env.MONGODB_URI)
		mongoDbURI = process.env.MONGODB_URI
	if(process.env.MONGODB_OPTIONS)
		mongoDbOptions = JSON.stringify(process.env.MONGODB_OPTIONS)

	var Agenda = require('agenda')
	var agenda = new Agenda()
		.database(mongoDbURI, 'daemonTasks')
		.processEvery('1 minute')

	//On termination of daemon, gracefully shut down jobs
	function gracefulShutdown() {
		agenda.stop(function() {
			console.log("Shutting down daemon server")
			process.exit(0)
		})
	}

	process.on('SIGTERM', gracefulShutdown)
	process.on('SIGINT' , gracefulShutdown)

	var fs = require('fs-extra')


	mongoose.connect(mongoDbURI, mongoDbOptions)

	var db = mongoose.connection
	db.on('error', function(err){
		//If the database can not be connected to, die
		console.error("Error connecting to MongoDB\r\n", err)
		process.exit()
	})
	db.once('open', function(){
		//Connection successful
		console.log("Successfully connected to MongoDB")

		//Begin loading our schema
		require('./Models/models')(mongoose, function(err, models){

			//Set up the agenda piece
			var Agenda = require('agenda')
			models.Agenda = new Agenda()
				.database(mongoDbURI, 'daemonTasks')

			// Connect to the Apple Push Notification Service
			models.APNAgent = require('./Modules/apnAgent')(models)

			if(err){
				console.log("Error loading models\r\n", err)
				process.exit()
			}

			var async = require('async')
			fs.readdir('./Daemons/', function(err, files){
				if(err){
					console.log(err)
					cb(err)
				} else {
					async.each(files, function(file, cb){
						fs.lstat('./Daemons/' + file, function(err, stat){
							if(err){
								cb(err)
							} else {
								if(stat.isFile()){
									var daemon = require('./Daemons/' + file)(models)
									agenda.define(daemon.name, daemon.options, daemon.job)
									cb(null)
								} else {
									cb(err)
								}
							}
						})
					}, function(err){
						if(err){
							console.log("Error starting daemon server: ", err)
							return
						}

						console.log("Starting daemon server")
						agenda.start()

					})
				}
			})

		})
	})

}