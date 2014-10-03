var bcrypt = require('bcrypt-nodejs')
var _ = require('underscore');

module.exports = function(mongoose, models){

	var schema = mongoose.Schema({
		email: {
			type: String,
			required: true,
			unique: true,
			validate: [
				{ validator: function(email){
						return email.length > 3
							&& email.indexOf('@') != -1
							&& email.indexOf('.') != -1
					},
				  msg: 'Invalid e-mail address'
				}
			]
		},
		firstName: String,
		lastName: String,
		password: String,

		permissions: { type: Object, defaultValue: {} },

		status: { type: String, default: 'registering' },
		locked: { type: Boolean, default: false },

		sessionToken: String,
		lastLogin: Date,

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now }
	})

	schema.methods.setPassword = function(password, cb){
			var self = this
			bcrypt.genSalt(10, function(err, salt){
				if(err){
					cb(err)
				} else {
					bcrypt.hash(password, salt, null, function(err, result){
						if(err){
							cb(err)
						} else {
							console.log(password, result)
							self.password = result
							self.save(function(err){
								cb(err)
							})
						}
					})
				}
			})
		}
	schema.methods.authenticatePassword = function(password, cb){
			bcrypt.compare(password, this.password, function(err, result){
				cb(err, result)
			})
		}

	schema.methods.json = function(){
		var self = this
		var user = {
			_id: self._id,
			email: self.email,
			firstName: self.firstName,
			lastName: self.lastName,
			permissions: self.permissions
		}

		return user
	}

	//Check to see if the user has the permissions listed
	schema.methods.hasPermission = function(permission){
		var self = this

		var object = self.permissions
		var attr = ''
		if(!self.permissions){
			return false
		}	
		var attributesList = permission.split('.')

		for(var i = 0; i < attributesList.length; i++){
			if(!object[attributesList[i]]){
				return false
			}
			attr += attributesList[i]
			object = object[attributesList[i]]
		}
		if(object){
			return true
		} else {
			return false
		}

	}

    schema.statics.AdminPermissions = {
        pushNotifications: {
            bulk: false,
            users: false
        },

        infrastructure: {
            view: true
        },

        admins: {
            edit: true,
            create:true,
            read:true
        },

        bars: {
            read: true,
            edit: true
        },

        questions: {
            read: true,
            edit: true
        },

        users: {
            read: true,
            edit:true,
            approve:true,
            deactivate:true,
            permissions:true
        },

        tips: {
            create: true,
            read: true,
            edit:true
        },

        promotions: {
            create: true,
            delete:true,
            view:true
        },

        courses: {
            create: true,
            read: true,
            delete:true
        },

        ads: {
            create: true,
            read: true
        }
    }

	schema.statics.permissionsExplanations = {
		admins: {
			create: 'Create or edit admin accounts',
            read: 'View admin info',
            edit: 'Edit admin info'
        },

        ads: {
        	create: 'Create or edit ads',
        	read: 'View ads'
        },

		bars: {
            read: 'View bars',
            edit: 'Edit bars'
        },
        questions: {
            read: 'Read questions',
            edit: 'Edit questions'
        },        
        pushNotifications: {
        	users: 'Send push notifications to individual users or bars.',
        	bulk: 'Can send bulk notifications.'
        },
        users: {
            read: 'Read user info',
            edit: 'Edit user info',
            approve: 'Approve a new user',
            deactivate: 'Deactivate user',
            permissions: 'Edit user permissions',
        },

        tips: {
        	read: 'Read tips',
        	edit: 'Edit existing tips',
        	create: 'Create tips'
        },

        promotions: {
        	view: 'View promotions',
            create: 'Create or edit new promotions',
            delete: 'Delete promotions'
        },

        courses: {
        	create: 'Create or edit new courses',
        	read: 'Look at current courses',
        	delete: 'Delete courses'
        },
    }

	return mongoose.model('Admin', schema)

}
