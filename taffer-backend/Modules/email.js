var mandrill = require('mandrill-api/mandrill'),
    swig = require('swig'),
    MANDRILL_API_KEY = process.env.MANDRILL_API_KEY || 'dDPJeLvZ1FyYk3QqyJzEag',
    mailBuilder = new mandrill.Mandrill(MANDRILL_API_KEY),
    fromEmail = process.env.DEFAULT_FROM_EMAIL || 'doNotReply@taffer.com'
    fromName = process.env.DEFAULT_FROM_NAME || 'DoNotReply'
    baseUrl = process.env.BASE_URL || 'http://taffer-dev.herokuapp.com'
    	baseUrl += '/static/'

module.exports = function(){

    var email = function(to, subject, emailTemplate, variables, cb){
        if(!(to instanceof Array)){
            to = [to]
        }

        var sendTo = []
        to.forEach(function(user){
        	if(typeof user == 'string'){
	            sendTo.push( { email: user })
        	} else {
        		sendTo.push({ email: user.email })
        	}
        })

        if(!variables){
        	variables = {}
        }
        variables.baseUrl = baseUrl
        
        mailBuilder.messages.send({
            message: {
                to: sendTo,
                subject: subject,
                html: swig.renderFile('./EmailTemplates/' + emailTemplate + '.html', variables),
                from_email: fromEmail,
                from_name: fromName
            }
        }, function(result){
            cb(null, result)
        }, function(err){
            cb(err)
        })

    }

    return email

}
