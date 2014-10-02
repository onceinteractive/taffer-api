var express = require('express')
var async = require('async')
var bcrypt = require('bcrypt-nodejs')

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC4e557e50e8350c7a0b1c3ddb24b6eb5f'
const TWILIO_ACCOUNT_AUTH_TOKEN = process.env.TWILIO_ACCOUNT_AUTH_TOKEN || 'e4610696247acbd0c91bf6079aedaad3'
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+18622197129'

var twilio = new (require('twilio')).RestClient(TWILIO_ACCOUNT_SID,TWILIO_ACCOUNT_AUTH_TOKEN)
var mail = require('../../Modules/email')()

module.exports = function(app, models) {

    var invite = express.Router()

    /*
        Example POST:
        {
            emails: [String] - emails
            phoneNumbers: [String] - Phone Number. Must be at between 9-10 DIGITS
        }
        Example Return:
        {
            email: {
                success: [String],    <- Emails successfully sent to
                validationErrors: [String], <- Emails with validation errors
                alreadySent: [String] <- Emails contacted previously
            },
            sms: {
                SMS: [Object],     <- SMS objects sent
                validationErrors: [String],    <- phone #s with validation errors
                alreadySent: [String]    <- Phone #s you've contacted previously
            }
        }
    */
    invite.route('/')
        .post(app.auth, function(req, res){
            if(!req.user.hasPermission('invite.send')){
                res.send(403)
                return
            }

            models.Bar.findOne({
                _id: req.user.barId
            })
                .populate('textsSent')
                .exec(function(err, bar){
                    if(err || !bar){
                        res.send(err, 500)
                        return
                    }

                    var results = {}

                    async.parallel([

                        //Handle the SMS
                        function(done){
                            if(!req.body.phoneNumbers || req.body.phoneNumbers.length == 0){
                                done(null)
                                return
                            }

                            if(!bar.textsSent){
                                bar.textsSent = []
                            }
                            if(typeof req.body.phoneNumbers == 'string'){
                                req.body.phoneNumbers = [req.body.phoneNumbers]
                            }
                            var alreadySentNumbers = [],
                                validationErrors = [],
                                SMSes = [],
                                errorSending = []

                            async.each(req.body.phoneNumbers, function(phoneNumber, done){
                                var alreadySent
                                bar.textsSent.forEach(function(text){
                                    //Check to see if we've used this number
                                    //Or, if they added "1" beforehand, check the
                                    //# without the first digit too
                                    if( bcrypt.compareSync(phoneNumber, text.phoneNumber)
                                        || bcrypt.compareSync(phoneNumber.substring(1), text.phoneNumber)){
                                            alreadySent = true
                                    }
                                })

                                if(alreadySent){
                                    alreadySentNumbers.push(phoneNumber)
                                    done(null)
                                    return
                                }

                                //Validate phone number lengths/characters, and message lengths
                                if(phoneNumber.length > 11 ||
                                    phoneNumber.length < 10){
                                        validationErrors.push(phoneNumber)
                                        done(null)
                                        return
                                }
                                //Validate that a phone number is only the digits
                                if(!(typeof phoneNumber != 'array' &&
                                    phoneNumber - parseFloat( phoneNumber ) >= 0)){
                                        validationErrors.push(phoneNumber)
                                        done(null)
                                        return
                                }

                                twilio.sms.messages.create({
                                    to: phoneNumber,
                                    from: TWILIO_PHONE_NUMBER,
                                    body: "You have been invited to join Taffer’s Bar HQ! Your Bar Code is " + bar.code + ". Download the app and start now!",
                                }, function(err, message){
                                    if(err){
                                        errorSending.push(phoneNumber)
                                        done(null)
                                    } else {
                                        models.SMS.create({
                                            barId: req.user.barId,
                                            sentBy: req.user._id,

                                            phoneNumber: bcrypt.hashSync(phoneNumber, bcrypt.genSaltSync()),
                                            message: "You have been invited to join Taffer’s Bar HQ! Your Bar Code is " + bar.code + ". Download the app and start now!",

                                            SID: message.sid,
                                            created: message.dateCreated
                                        }, function(err, SMS){
                                            if(SMS){
                                                SMSes.push(SMS)
                                            }
                                            done(null)
                                        })
                                    }
                                })

                            }, function(err){
                                results.sms = {
                                    SMS: SMSes,
                                    alreadySent: alreadySentNumbers,
                                    validationErrors: validationErrors,
                                    errorSending: errorSending
                                }
                                SMSes.forEach(function(sms){
                                    models.Bar.update({
                                        _id: bar.id
                                    }, { $push: { textsSent: sms._id } }, function(err){
                                        //Nothing to do here
                                    })
                                })
                                done(null)
                            })



                        },

                        //Handle the e-mails
                        function(done){
                            if(!req.body.emails || req.body.emails.length == 0){
                                done(null)
                                return
                            }

                            if(!bar.emailsSent){
                                bar.emailsSent = []
                            }

                            if(typeof req.body.emails == 'string'){
                                req.body.emails = [req.body.emails]
                            }

                            var toSend = [],
                                sent = [],
                                validationErrors = [],
                                alreadySent = [],
                                errorSending = []

                            async.each(req.body.emails, function(email, done){
                                if(email.length < 3 || email.indexOf('@') == -1 || email.indexOf('.') == -1){
                                    validationErrors.push(email)
                                    done(null)
                                    return
                                }

                                var sentTrigger
                                bar.emailsSent.forEach(function(address){
                                    //Check to see if we've used this email before
                                    if(bcrypt.compareSync(email, address)){
                                            sentTrigger = true
                                    }
                                })

                                if(sentTrigger){
                                    alreadySent.push(email)
                                    done(null)
                                    return
                                }

                                //By this point, if we're here, we're ready to send, so add it to the array
                                toSend.push(email)
                                done(null)

                            }, function(err){
                                if(toSend.length > 0){
                                    mail(toSend,
                                        bar.name + " - " + req.user.firstName + " " + req.user.lastName + " invited you to join Bar HQ",
                                        'employeeInvitation',
                                        {
                                            barCode:  bar.code,
                                            barName: bar.name
                                        },
                                        function(err, result){
                                            if(err){
                                                errorSending = toSend
                                                sent = []
                                            } else {
                                                sent = toSend
                                                errorSending = []

                                                var emailHashes = []
                                                toSend.forEach(function(email){
                                                    emailHashes.push(bcrypt.hashSync(email, bcrypt.genSaltSync()))
                                                })

                                                models.Bar.update({
                                                    _id: bar._id
                                                }, {
                                                    $pushAll: {
                                                        emailsSent: emailHashes
                                                    }
                                                }, function(err){
                                                    //Nothing to do
                                                })
                                            }
                                            results.email = {
                                                sent: sent,
                                                validationErrors: validationErrors,
                                                alreadySent: alreadySent,
                                                errorSending: errorSending
                                            }
                                            done(null)
                                        }
                                    )
                                } else {
                                    results.email = {
                                        sent: [],
                                        validationErrors: validationErrors,
                                        alreadySent: alreadySent,
                                        errorSending: []
                                    }
                                    done(null)
                                }
                            })

                        }

                    ], function(err){
                        if(err){
                            res.send(err, 500)
                        } else {
                            res.send(results)
                        }
                    })

                })
        })

    return invite
}
