var express = require('express')
var app = express()

//Use the Express Body Parser and Cookie Parser
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
app.use(bodyParser())
app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-secret'))
//Bring in multer to deal with multi-part
var multer = require('multer')
app.use(multer({
    dest: './.uploads/',
    rename: function (fieldname, filename) {
        return fieldname + '_' + filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    }
}))


//Connect to our database
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

        if(err){
            console.log("Error loading models\r\n", err)
            process.exit()
        }

        models.Admin.findOne({
            email: 'kchester@thisisfusion.com'
        }, function(err, admin){
            if(!err && !admin){
                var password = Math.random().toString(36).slice(-8)
                console.log('Creating new admin user. Password is ' + password)
                models.Admin.create({
                    email: 'kchester@thisisfusion.com',
                    firstName: 'Keith',
                    lastName: 'Chester'
                }, function(err, admin){
                    if(!err && admin){
                        admin.setPassword(password, function(err){})
                    }
                })
            }
        })

        // Connect to the Apple Push Notification Service
        var agent = require('./Modules/apnAgent')(models);
        app.set('apnagent', agent);

        //administration area route / console.
        app.use('/', express.static('./AdminApp'));

        //Set up the agenda piece
        var Agenda = require('agenda')
        models.Agenda = new Agenda()
            .database(mongoDbURI, 'daemonTasks')

        //Authentication
        app.adminAuth = require('./Modules/adminAuth')(models)

        var dropInRoutes = require('./Modules/dropInRoutes')(app, models)
        dropInRoutes('./AdminRoutes', function(err){
            if(err){
                process.exit()
            } else {
                //Launch the server, start listening
                app.listen(process.env.PORT || 8688)
            }
        })
    })
})
