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
		pictureURI: String,
		phoneNumber: String,

		role: String,
		customPermissions: { type: Boolean, defaultValue: false },
		permissions: Object,

		payRate: Number,

		devices: [{type: mongoose.Schema.Types.ObjectId, ref: 'Device'}],

		notifications: [{type: mongoose.Schema.Types.ObjectId, ref: 'Notification'}],

		messages: [mongoose.Schema.Types.ObjectId],

        shifts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Shift' }],

		status: { type: String, default: 'registering' },
		registrationStatus: {
			role: { type: Boolean, default: false },
			pictureURI: { type: Boolean, default: false },
			bar: { type: Boolean, default: false },
			approved: { type: Boolean, default: false }
		},
		locked: { type: Boolean, default: false },

		sessionToken: String,
		lastLogin: Date,

		barId: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar'},
		applyingToBarId: {type: mongoose.Schema.Types.ObjectId, ref: 'Bar'},
		pastBars: [{type: mongoose.Schema.Types.ObjectId, ref: 'Bar'}],

		courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SharedCourse', default: [] }],
        viewedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],
		completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],

		badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

		shared: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shareable' }],

        _lastChange: Number,


        facebookAccessToken: String,
        facebookAccessTokenDate: Date,
        facebookAccessTokenExpiration: Date,
        facebookTokenExpirationTask: mongoose.Schema.Types.ObjectId,
        facebookUserId: { type: String, index: true },


        twitterRequestToken: String,
        twitterRequestTokenSecret: String,
        twitterAccessToken: String,
        twitterSecretToken: String,
        twitterAccessDate: Date,
        twitterUserId: { type: String, index: true },

        tipsTriggered: [String],

		updated: { type: Date, default: Date.now },
		created: { type: Date, default: Date.now },
		ProfileNameTwitter:String,
		ProfileNameFacebook: String

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

	// schema.methods.resetPassword = function(cb){
	// 	var newPassword =
	// }

	schema.methods.json = function(attrs){
		var self = this
		var user = {
			_id: self._id,
			email: self.email,
			firstName: self.firstName,
			lastName: self.lastName,
			pictureURI: self.pictureURI,
			// payRate: self.payRate,
			status: self.status,
			locked: self.locked,
			registrationStatus: self.registrationStatus,
			role: self.role,
			permissions: self.permissions,
			phoneNumber: self.phoneNumber,
            completedCourses: self.completedCourses,
            barId: self.barId,
            tipsTriggered: self.tipsTriggered,
            id: self._id,  // Required for persistence.js
            _lastChange: self._lastChange, // Required for persistence.js
			ProfileNameTwitter:self.ProfileNameTwitter,
			twitterAccessToken: self.twitterAccessToken,
			ProfileNameFacebook:self.ProfileNameFacebook,
			facebookAccessToken: self.facebookAccessToken,
			facebookAccessTokenExpiration: self.facebookAccessTokenExpiration,
			Today: new Date()}
		if(!attrs){
			attrs = []
		}
		attrs.forEach(function(attr){
			user[attr] = self[attr]
		})

		if(self.badges
			&& self.badges.length > 0
			&& self.badges[0].json){
			user.badges = []
			self.badges.forEach(function(badge){
				user.badges.push(badge.json(self))
			})
		}

        if(self.twitterAccessToken
            && self.twitterSecretToken){
            user.twitter = true
        }

        if(self.facebookAccessToken &&
            ( !self.facebookAccessTokenExpiration ||
            ( self.facebookAccessTokenExpiration && new Date() > self.facebookAccessTokenExpiration) ) ){
            user.facebook = true
        }

		return user
	}

    schema.methods.lockUser = function(cb) {
        var self = this
        models.User.update({
            _id: self._id
        }, {
            locked: true,
            sessionToken: null
        }, function(err){
            cb(err)
        })
    }

	schema.methods.getUnreadMessagesCount = function() {
		var self = this;

		var unread = _.filter(self.notifications, function(notification) {
			return notification.shouldShow && notification.status === 'unread'
		});

		return unread.length;
	}
	schema.methods.getAndroidTokens = function() {
		var self = this;

		// Filters device tokens on the specified criteria, then returns only the tokens themselves
		return _.pluck(_.filter(self.devices, function(device) {
			return !device.unregistered && device.deviceToken && device.deviceType && device.deviceType.toUpperCase() === 'ANDROID';
		}), 'deviceToken');
	}

	schema.methods.getAppleTokens = function() {
		var self = this;

		// Filters device tokens on the specified criteria, then returns only the tokens themselves
		return _.pluck(_.filter(self.devices, function(device) {
			return !device.unregistered && device.deviceToken && device.deviceType && device.deviceType.toUpperCase() === 'IOS';
		}), 'deviceToken');
	}

	//Check to see if the user has the permissions listed
	schema.methods.hasPermission = function(permission){
		var self = this

		if(!self.permissions){
			return false
		}

		var object = self.permissions
		var attr = ''

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

	schema.methods.whoCanMessage = function(cb){
		var self = this

		models.User.find({
			barId: self.barId,
			locked: false
		}, function(err, users){
			if(err){
				cb(err)
			} else if(self.hasPermission('messages.sendToAll')){
                var messageableUsers = []
                users.forEach(function(user){
                    if(user._id.toString() != self._id.toString()){
                        messageableUsers.push(user)
                    }
                })
				cb(null, messageableUsers)
			} else {
				var canSend = []
				users.forEach(function(user){
                    if(user._id.toString() == self._id.toString){
                        return
                    } else if(user.hasPermission('messages.receiveFromAll')){
						canSend.push(user)
					}
				})
				cb(null, canSend)
			}
		})
	}

	schema.statics.permissionsExplanations = {
        users: {
            read: {
                defaultValue: false,
                description: 'Read employees info'
            },
            edit: {
                defaultValue: false,
                description: 'Edit employees info'
            },
            approve: {
                defaultValue: false,
                description: 'Approve a new employee'
            },
            deactivate: {
                defaultValue: false,
                description: 'Deactivate employees'
            },
            permissions: {
                defaultValue: false,
                description: 'Edit employee permissions'
            }
        },

        bars: {
        	edit: {
        		defaultValue: false,
        		description: "Edit the bar's information"
        	}
        },

        logbooks: {
            read: {
                defaultValue: false,
                description: 'Read logbook entries'
            },
            write: {
                defaultValue: false,
                description: 'Write logbook entries'
            }
        },

        promotions: {
            create: {
                defaultValue: false,
                description: 'Create new promotions'
            },
            edit: {
                defaultValue: false,
                description: 'Edit existing promotions'
            },
            delete: {
                defaultValue: false,
                description: 'Delete promotions'
            }
        },

        suggestionBox: {
            read: {
                defaultValue: false,
                description: 'Can read suggestions'
            }
        },

        sales: {
            create: {
                defaultValue: false,
                description: 'Can create sales data'
            },
            read: {
                defaultValue: false,
                description: 'Can read sales data'
            }
        },

        invite: {
            send: {
                defaultValue: false,
                description: 'Can send an invite to employees to join the Bar HQ app'
            }
        },

        courses: {
        	viewAll: {
        		defaultValue: false,
        		description: 'Can view all courses available'
        	},
        	share: {
        		defaultValue: false,
        		description: 'Can send courses to other employees for their review'
        	}
        },

        preshift: {
        	view: {
        		defaultValue: false,
        		description: 'Can view all preshifts messages'
        	},
        	send: {
        		defaultValue: false,
        		description: 'Can send preshift messages'
        	}
        },

        /*partender: {
        	view: {
        		defaultValue: false,
        		description: 'Can view the partender tile'
        	}
        },*/

        schedule: {
        	approveSwap: {
        		defaultValue: false,
        		description: 'Can approve shift swaps'
        	},
        	approveTimeOff: {
        		defaultValue: false,
        		description: 'Can approve time off requests'
        	},
            scheduleUsers: {
                defaultValue: false,
                description: 'Can schedule employee shifts'
            },
            scheduleEvents: {
                defaultValue: false,
                description: 'Can schedule events'
            }
        },

         messages: {
            sendToAll: {
                defaultValue: false,
                description: 'Can send a message to any other employee'
            },
            receiveFromAll: {
                defaultValue: false,
                description: 'Can be sent a message from any other employee'
            }
        },
        /*
        social: {
            manage: {
                defaultValue: false,
                description: 'Can manage and schedule social media posts for the bar'
            }
        }
        */

    }

	schema.methods.courseAssignableUsers = function(cb){
		var self = this
		if(!self.hasPermission('courses.share')){
			cb(null, [])
			return
		}

		models.User.find({
			barId: self.barId,
			$and: [
                    { $or: [ { locked: false }, { locked: { $exists: false } } ] },
                    { $or: [
                            { 'permissions.courses.viewAll': false },
                            { 'permissions.courses.viewAll': { $exists: false } }
                        ]
                    }
                ]
		}, function(err, users){
			cb(err, users)
		})
	}

	schema.statics.defaultAdminPermissions = {
		users: {
            read: true,
            edit: true,
            approve: true,
            deactivate: true,
            permissions: true
        },

        bars: {
        	edit: true
        },

        messages: {
        	sendToAll: true,
        	receiveFromAll: true
        },

        logbooks: {
            read: true,
            write: true
        },

        promotions: {
            create: true,
            edit: true,
            delete: true
        },

        suggestionBox: {
            read: true
        },

        sales: {
            create: true,
            read: true
        },

        invite: {
            send: true
        },

        courses: {
        	viewAll: true,
        	share: true
        },

        preshift: {
        	view: true,
        	send: true
        },

       /* partender: {
        	view: true
        },*/

        schedule: {
        	approveSwap: true,
        	approveTimeOff: true,
            scheduleEvents: true,
            scheduleUsers: true
        },
        /*
        social: {
            manage: true
        }
        */        
	}

	schema.statics.defaultStaffPermissions = {
		users: {
            read: false,
            edit: false,
            approve: false,
            deactivate: false,
            permissions: false
        },

        bars: {
        	edit: false
        },

        logbooks: {
            read: false,
            write: false
        },

        promotions: {
            create: false,
            edit: false,
            delete: false
        },

        suggestionBox: {
            read: false
        },

        sales: {
            create: true,
            read: false
        },

        invite: {
            send: false
        },

        courses: {
        	viewAll: false,
        	share: false
        },

        preshift: {
        	view: false,
        	send: false
        },

      /*  partender: {
        	view: false
        },*/

        schedule: {
        	approveSwap: false,
        	approveTimeOff: false,
        },
        /*
        social: {
            manage: false
        }
        */
	}

	schema.statics.defaultManagerPermissions = {
		users: {
            read: true,
            edit: true,
            approve: true,
            deactivate: false,
            permissions: false
        },

        messages: {
            sendToAll: true,
            receiveFromAll: true
        },

        bars: {
        	edit: true
        },

        logbooks: {
            read: true,
            write: true
        },

        promotions: {
            create: false,
            edit: false,
            delete: false
        },

        suggestionBox: {
            read: true
        },

        sales: {
            create: true,
            read: false
        },

        invite: {
            send: true
        },

        courses: {
        	viewAll: true,
        	share: true
        },

        preshift: {
        	view: true,
        	send: true
        },

      /*  partender: {
        	view: true
        },
*/
        schedule: {
        	approveSwap: true,
        	approveTimeOff: true,
            scheduleEvents: true,
            scheduleUsers: true
        }
	}

	schema.statics.editableFields = [
		'email',
		'firstName',
		'lastName',
		'payRate',
		'role',
		'phoneNumber',
		// 'permissions'
	]

	return mongoose.model('User', schema)

}
