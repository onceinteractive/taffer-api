const stream = require('stream'),
	fs = require('fs'),
	bcrypt = require('bcrypt-nodejs'),
	csv = require('csv')

if(process.argv.length < 4){
	console.log("loadData takes at least 2 arguments - node loadData bar.csv users.csv [localdb]")
	process.exit()
}

/*
	Bar headers:

	0- name
	1- streetAddress
	2- city
	3- state
	4- zipCode
	5- category
	6- e-mail domain

	User headers:

	0- email
	1- firstName
	2- lastName
	3- password
	4- phoneNumber
	5- role

*/

//Connect to our database
var mongoose = require('mongoose')
var mongoDbURI
if(process.argv.indexOf('localdb') != -1){
	mongoDbURI = 'mongodb://localhost/taffer'
} else {
	//mongoDbURI = 'mongodb://54.221.103.199/taffer'
    mongoDbURI = 'mongodb://developer:onceinteractive@ds035603.mongolab.com:35603/taffer-test'
}

var mongoDbOptions = {}
if(process.env.MONGODB_URI)
	mongoDbURI = process.env.MONGODB_URI
if(process.env.MONGODB_OPTIONS)
	mongoDbOptions = JSON.stringify(process.env.MONGODB_OPTIONS)

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

		console.log("Models loaded- beginning data load")

		var roles = {}
		models.Bar.defaultRoles.forEach(function(role){
			if(role.permissions == 'admin'){
				roles[role.position] = models.User.defaultAdminPermissions
			} else if(role.permissions == 'manager'){
				roles[role.position] = models.User.defaultManagerPermissions
			} else {
				roles[role.position] = models.User.defaultStaffPermissions
			}
		})

		csv()
			.from(process.argv[2])
			.on('record', function(row, index){
				if(index == 0 && process.argv.indexOf('--headers') != -1){
					return
				}

				var domain = row[6]

				models.Bar.create({
					name: row[0],
					streetAddress: row[1],
					city: row[2],
					state: row[3],
					zipCode: row[4],
					category: row[5],
					roles: roles
				}, function(err, bar){
					if(err){
						console.log("Error thrown while creating bar " + row[0], err)
						process.exit()
					}
					bar.generateCode(function(err, bar){
						if(err){
							console.log("Error thrown while creating bar code for " + bar.name, bar)
							process.exit()
						}

						csv()
							.from(process.argv[3])
							.on('record', function(row, index){
								if(index == 0 && process.argv.indexOf('--headers') != -1){
									return
								}

								models.User.create({
									email: row[0][0].toLowerCase() + row[1].toLowerCase() + '@' + domain.toLowerCase() + '.com',
									barId: bar._id,
									firstName: row[0],
									lastName: row[1],
									password: bcrypt.hashSync(row[2], bcrypt.genSaltSync(10)),
									phoneNumber: row[3],
									role: row[4],
									permissions: bar.roles[row[4]]
								}, function(err, user){
									if(err){
										console.log('Error creating user ' + row[0] + ' for bar ' + bar.name, err)
										process.exit()
									}
								})
							})
					})

				})
			})
			.on('end', function(){
				console.log("Done loading all bars and users")
			})


	})
})
