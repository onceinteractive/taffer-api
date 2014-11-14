var cluster = require('cluster')
var express = require('express')

//Cluster out, or create cluster watcher
if(cluster.isMaster && process.argv.indexOf('noCluster') == -1){

	if(process.argv.indexOf('oneWorker') == -1){
		for(var fork = 0; fork < require('os').cpus().length; fork++){
			cluster.fork()
		}
	} else {
		//Fork once and only once
		cluster.fork()
	}

	cluster.on('online', function(worker){
		console.log("Worker process " + worker.process.pid + " is online")
	})
	cluster.on('exit', function(worker){
		console.log("Worker process " + worker.process.pid + " has died. Booting another.")
		cluster.fork()
	})

	// if(process.argv.indexOf('noHealthCheck') == -1){
	// 	var healthApp = express()
	// 	require('./healthCheck')(healthApp)
	// 	console.log("Health check is live")
	// 	healthApp.listen(process.env.HEALTH_CHECK_PORT || 9001)
	// }

} else {

	//Use the Express Body Parser and Cookie Parser
	var bodyParser = require('body-parser')
	var cookieParser = require('cookie-parser')
	require('datejs')
	var multer = require('multer')

	var mongoose = require('mongoose')

	//Connect to our database
	var mongoDbURI
	if(process.argv.indexOf('localdb') != -1){
		mongoDbURI = 'mongodb://localhost/taffer'
	} else {
		//mongoDbURI = 'mongodb://54.221.103.199/taffer'

        /*Test Database*/
        //mongoDbURI = 'mongodb://tafferUser:welcome83@ds043170.mongolab.com:43170/heroku_app30278662'

        /*Demo Database*/
        //mongoDbURI = 'mongodb://tafferUser:welcome83@ds047930.mongolab.com:47930/heroku_app30886667'
        //mongoDbURI = 'mongodb:///tafferUser:welcome83@linus.mongohq.com:10051/app30886667'

        /*Prod Database*/
        mongoDbURI = 'mongodb://barhq_prod_user:taFFerBarhQ@ds053740-a0.mongolab.com:53740,ds053740-a1.mongolab.com:53740/prod_barhq'

	}

	var mongoDbOptions = {}
	if(process.env.MONGODB_URI)
		mongoDbURI = process.env.MONGODB_URI
	if(process.env.MONGODB_OPTIONS)
		mongoDbOptions = JSON.stringify(process.env.MONGODB_OPTIONS)

	var app = express()
	app.use(bodyParser({ limit: '25mb' }))
	app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'))
	//Bring in multer to deal with multi-part

	app.use(multer({
		dest: './.uploads/',
		rename: function (fieldname, filename) {
			return fieldname + '_' + filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
		}
	}))

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.header("Access-Control-Allow-Headers", "Content-Type");
		next();
	});

	mongoose.connect(mongoDbURI, mongoDbOptions)

	//E-mail
	app.mail = require('./Modules/email')()

	var db = mongoose.connection
	db.on('error', function(err){
		//If the database can not be connected to, die
		console.error("Error connecting to MongoDB\r\n", err)
		process.exit()
	})
	db.once('open', function(){
		//Connection successful
		console.log("Successfully connected to MongoDB")

		// If the Node process ends, close the Mongoose connection
		process.on('uncaughtException', function (err) {
			console.log('Uncaught exception at ' + new Date() +': ')
			console.log(err)
			console.log(err.stack)
			mongoose.connection.close(function () {
				process.exit(0)
			})
		})

		//Begin loading our schema
		require('./Models/models')(mongoose, function(err, models){

			if(err){
				console.log("Error loading models\r\n", err)
				process.exit()
			}

			//Set up the agenda piece
			var Agenda = require('agenda')
			models.Agenda = new Agenda()
				.database(mongoDbURI, 'daemonTasks')

			//Authentication
			//TODO - facebook/twitter login?
			app.auth = require('./Modules/auth')(models)

			//Second - our update time adjustor
			// app.use(function(req, res, next){
			// 	if(req.body && req.body.updated && req.body.now){
			// 		req.body.updated = new Date(req.body.updated)
			// 	}
			// })

			// Connect to the Apple Push Notification Service
			var agent = require('./Modules/apnAgent')(models);
			app.set('apnagent', agent);

			// Connect to the Apple Push Notification Feedback Service
			var feedback = require('./Modules/apnFeedback')(models);

			//Set static content service routes
			app.use('/static', express.static('./StaticAssets/'))

			var dropInRoutes = require('./Modules/dropInRoutes')(app, models)
			dropInRoutes('./Routes', function(err){
				if(err){
					process.exit()
				} else {
					//Launch the server, start listening
					app.listen(process.env.PORT || 8688)
				}
			})
		})
	})

}
